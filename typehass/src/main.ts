import { runAutomationDaemon } from "./automation/mod.ts";
import { runSdkSyncDaemon } from "./sdk_sync/mod.ts";
import { runTypegenDaemon } from "./typegen/mod.ts";

await runSdkSyncDaemon();
await runTypegenDaemon();
await runAutomationDaemon();
