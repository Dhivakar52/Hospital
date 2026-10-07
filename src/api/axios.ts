import axios from "axios";

const RAW_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://6b14-103-94-173-10.ngrok-free.app";

/**
 * Centralized API Base URL.
 * When accessed from a browser on localhost, 127.0.0.1, or local development network (or in Vite DEV mode),
 * we use relative base URL ("") so requests go through the Vite dev/preview server proxy (/api).
 * This completely avoids browser CORS preflight (OPTIONS 401) blocking from the ngrok tunnel.
 */


console.log(RAW_BASE_URL, "RR")
export const getApiBaseUrl = (): string => {
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

  return RAW_BASE_URL.replace(/\/+$/, "");
};

export const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-api-key": import.meta.env.VITE_API_KEY || "SRMGH",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 30000,
});

// Ensure runtime requests in browser on local development hosts always route via proxy
api.interceptors.request.use((config) => {
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
    }
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
