import {
  createLogger,
  HomeAssistantWs,
  type TypeHassContext,
} from "../lib/mod.ts";

const AUTOMATIONS_ENTRYPOINT = "file:///config/typehass/main.ts";

type AutomationModule = {
  default?: (ctx: TypeHassContext) => unknown | Promise<unknown>;
};

async function run(ctx: TypeHassContext): Promise<never> {
  console.log("Starting TypeHass daemon");
  console.log(`Loading automations from ${AUTOMATIONS_ENTRYPOINT}`);

  try {
    const mod = await import(AUTOMATIONS_ENTRYPOINT) as AutomationModule;

    if (typeof mod.default !== "function") {
      throw new Error(
        `Automation entrypoint must default-export a function: ${AUTOMATIONS_ENTRYPOINT}`,
      );
    }

    await mod.default(ctx);

    console.log("TypeHass automations loaded");
  } catch (error) {
    console.error("Failed to load TypeHass automations:", error);
    throw error;
  }

  return await keepAlive();
}

function keepAlive(): Promise<never> {
  return new Promise<never>(() => {});
}

export const runAutomationDaemon = async () => {
  const LOG_LEVEL = Deno.env.get("LOG_LEVEL") as
    | "debug"
    | "info"
    | "warn"
    | "error"
    | "silent" ??
    "info";
  const logger = createLogger("automations", LOG_LEVEL);

  const HA_WS_URL = "ws://supervisor/core/websocket";
  const HA_TOKEN = Deno.env.get("SUPERVISOR_TOKEN");

  if (!HA_TOKEN) {
    throw new Error("Missing SUPERVISOR_TOKEN environment variable!");
  }

  const ha = await HomeAssistantWs.connect({
    url: HA_WS_URL,
    token: HA_TOKEN,
    logger,
  });

  return await run({ ha, logger });
};
