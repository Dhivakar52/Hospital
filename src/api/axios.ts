import axios from "axios";

export interface AppConfig {
  API_BASE_URL: string;
  API_KEY: string;
}

let appConfig: AppConfig | null = null;
let configPromise: Promise<AppConfig> | null = null;

/**
 * Centralized API Base URL resolver.
 * When accessed from a browser on localhost, 127.0.0.1, or local development network (or in Vite DEV mode),
 * we use relative base URL ("") so requests go through the Vite dev/preview server proxy (/api).
 * This completely avoids browser CORS preflight blocking.
 */
export const getApiBaseUrl = (rawUrl?: string): string => {
  const url = rawUrl || appConfig?.API_BASE_URL || "";
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      !host ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.startsWith("172.")
    ) {
      return "";
    }
  }

  if (import.meta.env.DEV) {
    return "";
  }

  return url.replace(/\/+$/, "");
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Existing centralized Axios instance.
 * Configuration (baseURL and x-api-key) is populated at runtime via loadAppConfig().
 */
export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 30000,
});

/**
 * Initializes the Axios instance defaults with loaded runtime configuration.
 */
function initAxiosConfig(config: AppConfig): void {
  api.defaults.baseURL = getApiBaseUrl(config.API_BASE_URL);
  api.defaults.headers.common["x-api-key"] = config.API_KEY;
}

/**
 * Loads runtime configuration from /config.json via fetch.
 * API configuration is loaded exclusively from public/config.json at runtime.
 */
export async function loadAppConfig(): Promise<AppConfig> {
  if (appConfig) {
    return appConfig;
  }

  if (!configPromise) {
    configPromise = (async () => {
      try {
        const response = await fetch("/config.json", {
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load runtime configuration (/config.json): HTTP ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (
          !data ||
          typeof data.API_BASE_URL !== "string" ||
          typeof data.API_KEY !== "string" ||
          !data.API_BASE_URL.trim() ||
          !data.API_KEY.trim()
        ) {
          throw new Error(
            "Invalid runtime configuration in /config.json: API_BASE_URL and API_KEY must be non-empty strings."
          );
        }

        appConfig = {
          API_BASE_URL: data.API_BASE_URL,
          API_KEY: data.API_KEY,
        };

        initAxiosConfig(appConfig);

        return appConfig;
      } catch (error) {
        configPromise = null;
        throw error;
      }
    })();
  }

  return configPromise;
}

export function getAppConfig(): AppConfig | null {
  return appConfig;
}

// Ensure runtime requests always have loaded config and route correctly
api.interceptors.request.use(async (config) => {
  if (!appConfig) {
    await loadAppConfig();
  }

  if (!appConfig || !appConfig.API_KEY || !appConfig.API_BASE_URL) {
    throw new Error(
      "API request blocked: Runtime configuration could not be loaded from /config.json."
    );
  }

  if (config.headers) {
    if (typeof config.headers.set === "function") {
      config.headers.set("x-api-key", appConfig.API_KEY);
    } else {
      (config.headers as any)["x-api-key"] = appConfig.API_KEY;
    }
  }

    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (
        !host ||
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.startsWith("192.168.") ||
        host.startsWith("10.") ||
        host.startsWith("172.")
      ) {
        config.baseURL = "";
      } else {
        config.baseURL = appConfig.API_BASE_URL.replace(/\/+$/, "");
      }
    } else {
      config.baseURL = appConfig.API_BASE_URL.replace(/\/+$/, "");
    }

  return config;
});

/**
 * Formats API errors into clean, user-friendly messages.
 * Prevents leaking raw Axios internal objects into the UI.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "Unable to complete request. Please try again."
): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data as Record<string, any> | undefined;

    // Check if responseData has nested Eka response string, e.g. "{\"error\":\"SessionExpiredTryAgain\",\"code\":491}"
    if (typeof responseData?.response === "string") {
      try {
        const parsed = JSON.parse(responseData.response);
        if (parsed.error === "SessionExpiredTryAgain") {
          return "Session expired on Eka server (SessionExpiredTryAgain). Please try again.";
        }
        if (parsed.error || parsed.message) {
          return String(parsed.error || parsed.message);
        }
      } catch {
        if (responseData.response.includes("SessionExpiredTryAgain")) {
          return "Session expired on Eka server (SessionExpiredTryAgain). Please try again.";
        }
      }
    }

    // Check if server returned a structured error message
    const serverMessage =
      responseData?.error ||
      responseData?.message ||
      (typeof responseData?.detail === "string" ? responseData.detail : null);

    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return "The request timed out. Please check your connection and try again.";
    }

    if (!error.response) {
      return "Network connection error. Please verify your connection and try again.";
    }

    if (serverMessage && typeof serverMessage === "string") {
      return serverMessage;
    }

    switch (status) {
      case 400:
        return "Invalid request details. Please check your input and try again.";
      case 401:
      case 403:
        return "Unauthorized request. Please verify your credentials or permissions.";
      case 404:
        return "Requested service endpoint not found (404).";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Backend server error. Please try again shortly.";
      default:
        return fallbackMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export default api;
