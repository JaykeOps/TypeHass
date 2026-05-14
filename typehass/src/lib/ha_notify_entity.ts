import type { HomeAssistantWs } from "./ha_ws.ts";
import type { Logger } from "./ha_logger.ts";
import type { EntityId, NotifyEntityId } from "./ha_types.ts";

export const createNotifyEntityPublisher = <
  TEntityId extends EntityId = EntityId,
>(
  ha: HomeAssistantWs<TEntityId>,
  entityId: NotifyEntityId<TEntityId>,
  logger?: Logger,
) => ({
  publish(options: {
    title?: string;
    message: string;
  }) {
    logger?.info("Sending notify entity message", {
      entityId,
      title: options.title,
      message: options.message,
    });

    ha.callService("notify", "send_message", {
      entity_id: entityId,
      title: options.title,
      message: options.message,
    });
  },
});
