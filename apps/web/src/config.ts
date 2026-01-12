export interface AppConfig {
  googleClientId: string;
  apiBaseUrl: string;
}

type AppConfigSource = Partial<Record<keyof AppConfig, unknown>>;

const CONFIG_PATH = "/config.json";
let cachedConfig: AppConfig | null = null;

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const readInlineConfig = (): AppConfigSource | null => {
  // Prefer runtime injection via public/config.js (window.__APP_CONFIG__).
  const windowConfig = (window as Window & { __APP_CONFIG__?: AppConfigSource }).__APP_CONFIG__;
  return windowConfig ?? null;
};

const loadJsonConfig = async (): Promise<AppConfigSource> => {
  // Fallback: fetch config.json for environments that prefer JSON deployment.
  const response = await fetch(CONFIG_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${CONFIG_PATH}.`);
  }

  return (await response.json()) as AppConfigSource;
};

const parseConfig = (data: AppConfigSource, sourceLabel: string): AppConfig => {
  const googleClientId = normalizeString(data.googleClientId);
  const apiBaseUrl = normalizeString(data.apiBaseUrl);

  if (!googleClientId) {
    throw new Error(`${sourceLabel} is missing googleClientId.`);
  }

  if (!apiBaseUrl) {
    throw new Error(`${sourceLabel} is missing apiBaseUrl.`);
  }

  return {
    googleClientId,
    apiBaseUrl: apiBaseUrl.replace(/\/$/, "")
  };
};

export const loadAppConfig = async (): Promise<AppConfig> => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const inlineConfig = readInlineConfig();
  if (inlineConfig) {
    cachedConfig = parseConfig(inlineConfig, "config.js");
    return cachedConfig;
  }

  const jsonConfig = await loadJsonConfig();
  cachedConfig = parseConfig(jsonConfig, "config.json");
  return cachedConfig;
};

export const getCachedConfig = (): AppConfig | null => cachedConfig;
