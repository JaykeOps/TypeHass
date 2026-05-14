import type { EntityId, HassState } from "./ha_types.ts";
import type { Logger } from "./ha_logger.ts";

type RawStateChangedEvent<TEntityId extends EntityId> = {
  entity_id: TEntityId;
  old_state: HassState<TEntityId> | null;
  new_state: HassState<TEntityId> | null;
};

export type StateChangedEvent<
  TEntityId extends EntityId = EntityId,
> = {
  entityId: TEntityId;
  oldState: HassState<TEntityId> | null;
  newState: HassState<TEntityId> | null;
};

type StateChangedHandler<E extends EntityId> = (
  event: StateChangedEvent<E>,
) => void;

export class HomeAssistantWs<TEntityId extends EntityId = EntityId> {
  private ws?: WebSocket;
  private nextId = 1;
  private isConnected = false;
  private shouldReconnect = true;

  private stateChangedHandlers = new Map<
    TEntityId,
    StateChangedHandler<TEntityId>[]
  >();

  private subscribedToStateChanges = false;

  private constructor(
    private options: {
      url: string;
      token: string;
      logger: Logger;
      reconnectMs?: number;
    },
  ) {}

  static async connect<TEntityId extends EntityId = EntityId>(options: {
    url: string;
    token: string;
    logger: Logger;
    reconnectMs?: number;
  }): Promise<HomeAssistantWs<TEntityId>> {
    const client = new HomeAssistantWs<TEntityId>(options);
    await client.open();
    return client;
  }

  close() {
    this.shouldReconnect = false;
    this.ws?.close();
  }

  private open(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.options.url);
      this.ws = ws;

      let settled = false;

      this.options.logger.info("Connecting to Home Assistant WebSocket", {
        url: this.options.url,
      });

      ws.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "auth_required") {
          this.send({
            type: "auth",
            access_token: this.options.token,
          });
          return;
        }

        if (message.type === "auth_ok") {
          this.isConnected = true;

          this.options.logger.info("Authenticated with Home Assistant");

          this.resubscribe();

          if (!settled) {
            settled = true;
            resolve();
          }

          return;
        }

        if (message.type === "auth_invalid") {
          this.shouldReconnect = false;

          const error = new Error(
            `Home Assistant auth failed: ${message.message}`,
          );

          this.options.logger.error("Authentication failed", {
            message: message.message,
          });

          if (!settled) {
            settled = true;
            reject(error);
          }

          return;
        }

        if (message.type === "result") {
          this.handleResult(message);
          return;
        }

        if (message.type === "event") {
          this.handleEvent(message);
          return;
        }
      });

      ws.addEventListener("close", (event) => {
        this.isConnected = false;

        this.options.logger.warn("WebSocket closed", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        if (!settled) {
          settled = true;
          reject(new Error("Home Assistant WebSocket closed before auth"));
        }

        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      });

      ws.addEventListener("error", () => {
        this.options.logger.error("WebSocket error");
      });
    });
  }

  private scheduleReconnect() {
    const reconnectMs = this.options.reconnectMs ?? 5_000;

    this.options.logger.warn("Scheduling Home Assistant WebSocket reconnect", {
      reconnectMs,
    });

    setTimeout(() => {
      void this.open().catch((error) => {
        this.options.logger.error("Reconnect attempt failed", {
          error: error instanceof Error ? error.message : String(error),
        });

        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      });
    }, reconnectMs);
  }

  private resubscribe() {
    if (!this.subscribedToStateChanges) return;

    this.options.logger.info("Re-subscribing to state_changed events");

    this.send({
      id: this.nextId++,
      type: "subscribe_events",
      event_type: "state_changed",
    });
  }

  onStateChanged<E extends TEntityId>(
    entityId: E,
    handler: StateChangedHandler<E>,
  ) {
    const handlers = this.stateChangedHandlers.get(entityId) ?? [];

    handlers.push(handler as StateChangedHandler<TEntityId>);
    this.stateChangedHandlers.set(entityId, handlers);

    this.options.logger.info("Registered state_changed handler", {
      entityId,
      handlerCount: handlers.length,
    });

    if (!this.subscribedToStateChanges) {
      this.subscribedToStateChanges = true;

      if (this.isConnected) {
        this.send({
          id: this.nextId++,
          type: "subscribe_events",
          event_type: "state_changed",
        });
      }
    }
  }

  callService(
    domain: string,
    service: string,
    serviceData: Record<string, unknown>,
  ) {
    if (!this.isConnected || !this.ws) {
      this.options.logger.warn("Cannot call service while WebSocket is closed", {
        domain,
        service,
        entityId: serviceData.entity_id,
      });

      return;
    }

    const id = this.nextId++;

    this.options.logger.info("Calling service", {
      id,
      domain,
      service,
      entityId: serviceData.entity_id,
    });

    this.send({
      id,
      type: "call_service",
      domain,
      service,
      service_data: serviceData,
    });

    return id;
  }

  private send(message: Record<string, unknown>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.options.logger.warn("Tried to send while WebSocket was not open", {
        type: message.type,
        id: message.id,
      });

      return;
    }

    this.ws.send(JSON.stringify(message));
  }

  private handleResult(message: {
    id: number;
    success: boolean;
    result?: unknown;
    error?: unknown;
  }) {
    if (message.success) {
      this.options.logger.info("Home Assistant command succeeded", {
        id: message.id,
        result: message.result,
      });
      return;
    }

    this.options.logger.error("Home Assistant command failed", {
      id: message.id,
      error: message.error,
    });
  }

  private handleEvent(message: {
    event?: {
      event_type?: string;
      data?: RawStateChangedEvent<TEntityId>;
    };
  }) {
    if (message.event?.event_type !== "state_changed") return;

    const raw = message.event.data;
    if (!raw) return;

    const event: StateChangedEvent<TEntityId> = {
      entityId: raw.entity_id,
      oldState: raw.old_state,
      newState: raw.new_state,
    };

    const handlers = this.stateChangedHandlers.get(event.entityId) ?? [];

    this.options.logger.debug("Dispatching state_changed event", {
      entityId: event.entityId,
      oldState: event.oldState?.state,
      newState: event.newState?.state,
      handlerCount: handlers.length,
    });

    for (const handler of handlers) {
      try {
        handler(event);
      } catch (error) {
        this.options.logger.error("state_changed handler failed", {
          entityId: event.entityId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
}
