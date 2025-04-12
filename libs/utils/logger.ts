import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

// Use a simpler configuration for Next.js compatibility
const logger = pino({
    level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
    // Remove the transport option that's causing the worker issue
    transport: undefined,
    // Add formatting for better readability without pino-pretty
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

export default logger;
