import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from "axios";
import logger from "../logger";

// Create a base axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "",
    timeout: 60000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Store CSRF token
let csrfToken: string | null = null;

// Fetch CSRF token when needed
const fetchCSRFToken = async (): Promise<string> => {
    try {
        const response = await fetch("/api/csrf", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch CSRF token");
        }

        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        logger.error({ error }, "Error fetching CSRF token");
        throw error;
    }
};

// Request interceptor to add CSRF token to state-changing requests
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const method = config.method?.toUpperCase() || "";

        // Only add CSRF token for state-changing methods
        if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
            try {
                // Get token if we don't already have one
                if (!csrfToken) {
                    csrfToken = await fetchCSRFToken();
                }

                // Add CSRF token to headers
                config.headers.set("x-csrf-token", csrfToken);
            } catch (error) {
                logger.error({ error }, "Failed to add CSRF token to request");
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Response interceptor to handle CSRF token expiration
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig;

        // If error is due to CSRF token expiration/invalidation (403 Forbidden)
        if (
            error.response?.status === 403 &&
            error.response?.data &&
            typeof error.response.data === "object" &&
            "error" in error.response.data &&
            /csrf/i.test(String(error.response.data.error)) &&
            originalRequest
        ) {
            // Reset CSRF token
            csrfToken = null;

            try {
                // Get new token
                csrfToken = await fetchCSRFToken();

                // Update CSRF token in the request
                originalRequest.headers.set("x-csrf-token", csrfToken);

                // Retry the request with new token
                return axiosInstance(originalRequest);
            } catch (retryError) {
                return Promise.reject(retryError);
            }
        }

        return Promise.reject(error);
    },
);

// Types for data parameters
type RequestData = Record<string, unknown>;

// HTTP request methods
export const dataLayer = {
    get: <T>(url: string, config?: Partial<InternalAxiosRequestConfig>) =>
        axiosInstance.get<T>(url, config),

    post: <T>(
        url: string,
        data?: RequestData,
        config?: Partial<InternalAxiosRequestConfig>,
    ) => axiosInstance.post<T>(url, data, config),

    put: <T>(
        url: string,
        data?: RequestData,
        config?: Partial<InternalAxiosRequestConfig>,
    ) => axiosInstance.put<T>(url, data, config),

    patch: <T>(
        url: string,
        data?: RequestData,
        config?: Partial<InternalAxiosRequestConfig>,
    ) => axiosInstance.patch<T>(url, data, config),

    delete: <T>(url: string, config?: Partial<InternalAxiosRequestConfig>) =>
        axiosInstance.delete<T>(url, config),
};

// Note: Rate limiting is already handled by the middleware
// The server applies rate limiting, and the client receives 429 status codes when limits are exceeded
// This layer will automatically handle rate limit errors through the normal axios error handling

export default dataLayer;
