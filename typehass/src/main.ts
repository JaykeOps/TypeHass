import { runAutomationDaemon } from "./automation/mod.ts";
import { runTypegenDaemon } from "./typegen/mod.ts"

await runTypegenDaemon();
await runAutomationDaemon();