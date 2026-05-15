const CONFIG_DIR = "/config/typehass";
const GENERATED_DIR = `${CONFIG_DIR}/sdk/generated`;
const GENERATED_FILE = `${GENERATED_DIR}/mod.ts`;
const SDK_SOURCE_DIR = "/app/src/lib";
const SDK_TARGET_DIR = `${CONFIG_DIR}/sdk`;
const DENO_CONFIG_FILE = `${CONFIG_DIR}/deno.json`;
const TSCONFIG_FILE = `${CONFIG_DIR}/tsconfig.json`;

const TYPEHASS_IMPORTS: Record<string, string> = {
  "typehass": "./sdk/mod.ts",
  "typehass/": "./sdk/",
  "typehass/generated": "./sdk/generated/mod.ts",
  "typehass/generated/": "./sdk/generated/",
};

const TYPESCRIPT_TYPEHASS_PATHS: Record<string, string[]> = {
  "typehass": ["./sdk/mod.ts"],
  "typehass/*": ["./sdk/*"],
  "typehass/generated": ["./sdk/generated/mod.ts"],
};

async function ensureDir(path: string): Promise<void> {
  await Deno.mkdir(path, { recursive: true });
}

async function copyDirectory(sourceDir: string, targetDir: string): Promise<void> {
  await ensureDir(targetDir);

  for await (const entry of Deno.readDir(sourceDir)) {
    const sourcePath = `${sourceDir}/${entry.name}`;
    const targetPath = `${targetDir}/${entry.name}`;

    if (entry.isDirectory) {
      await copyDirectory(sourcePath, targetPath);
      continue;
    }

    if (!entry.isFile) {
      continue;
    }

    await Deno.copyFile(sourcePath, targetPath);
  }
}

async function readExistingJsonConfig(
  configFile: string,
): Promise<Record<string, unknown>> {
  try {
    const content = await Deno.readTextFile(configFile);
    const parsed = JSON.parse(content);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return {};
    }

    console.warn("Could not read existing TypeHass config; replacing it", {
      configFile,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return {};
}

async function writeDenoConfig(
  configFile: string,
  imports: Record<string, string>,
): Promise<void> {
  const existingConfig = await readExistingJsonConfig(configFile);
  const existingImports =
    existingConfig.imports && typeof existingConfig.imports === "object" &&
      !Array.isArray(existingConfig.imports)
      ? existingConfig.imports as Record<string, unknown>
      : {};

  const config = {
    ...existingConfig,
    imports: {
      ...existingImports,
      ...imports,
    },
  };

  await Deno.writeTextFile(
    configFile,
    `${JSON.stringify(config, null, 2)}\n`,
  );
}

async function writeTsConfig(): Promise<void> {
  const existingConfig = await readExistingJsonConfig(TSCONFIG_FILE);
  const existingCompilerOptions =
    existingConfig.compilerOptions &&
      typeof existingConfig.compilerOptions === "object" &&
      !Array.isArray(existingConfig.compilerOptions)
      ? existingConfig.compilerOptions as Record<string, unknown>
      : {};
  const existingPaths =
    existingCompilerOptions.paths &&
      typeof existingCompilerOptions.paths === "object" &&
      !Array.isArray(existingCompilerOptions.paths)
      ? existingCompilerOptions.paths as Record<string, unknown>
      : {};

  const config = {
    ...existingConfig,
    compilerOptions: {
      ...existingCompilerOptions,
      target: existingCompilerOptions.target ?? "ES2022",
      module: existingCompilerOptions.module ?? "ESNext",
      moduleResolution: existingCompilerOptions.moduleResolution ?? "Bundler",
      noEmit: existingCompilerOptions.noEmit ?? true,
      allowImportingTsExtensions:
        existingCompilerOptions.allowImportingTsExtensions ?? true,
      baseUrl: existingCompilerOptions.baseUrl ?? ".",
      lib: existingCompilerOptions.lib ?? ["ES2023", "DOM", "DOM.Iterable"],
      paths: {
        ...existingPaths,
        ...TYPESCRIPT_TYPEHASS_PATHS,
      },
    },
    include: existingConfig.include ?? ["**/*.ts"],
  };

  await Deno.writeTextFile(
    TSCONFIG_FILE,
    `${JSON.stringify(config, null, 2)}\n`,
  );
}

async function ensureGeneratedFallback(): Promise<void> {
  try {
    await Deno.stat(GENERATED_FILE);
    return;
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }

  await ensureDir(GENERATED_DIR);
  await Deno.writeTextFile(
    GENERATED_FILE,
    `// Fallback TypeHass generated module.
// This file is replaced with Home Assistant-specific types after type sync.

export const ENTITY_IDS = [] as const;
export type EntityId = string;

export const SERVICE_IDS = [] as const;
export type ServiceId = string;

export type HassState<E extends EntityId = EntityId> = {
  entity_id: E;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
};

export type HassEntities = Partial<{
  [E in EntityId]: HassState<E>;
}>;
`,
  );
}

export async function runSdkSyncDaemon(): Promise<void> {
  await copyDirectory(SDK_SOURCE_DIR, SDK_TARGET_DIR);
  await ensureGeneratedFallback();
  await writeDenoConfig(DENO_CONFIG_FILE, TYPEHASS_IMPORTS);
  await writeTsConfig();

  console.log(`Synced TypeHass SDK to ${SDK_TARGET_DIR}`);
  console.log(`Synced TypeHass editor config to ${DENO_CONFIG_FILE}`);
  console.log(`Synced TypeHass TypeScript config to ${TSCONFIG_FILE}`);
}
