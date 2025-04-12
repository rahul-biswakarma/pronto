import logger from "./logger";

/**
 * Creates a standardized success response for API endpoints
 * @param data Response data to return
 * @param requestId Optional request ID for logging
 * @param status HTTP status code
 */
export function createSuccessResponse<T extends Record<string, unknown>>(
    data: T,
    requestId?: string,
    status = 200,
): Response {
    if (requestId) {
        logger.debug(
            { requestId, responseStatus: status },
            "API success response",
        );
    }

    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * Creates a standardized error response for API endpoints
 * @param message Error message or error object
 * @param requestId Optional request ID for logging
 * @param status HTTP status code
 */
export function createErrorResponse(
    message: string | Error | unknown,
    requestId?: string,
    status = 500,
): Response {
    const errorMessage =
        message instanceof Error
            ? message.message
            : typeof message === "string"
              ? message
              : "An unknown error occurred";

    if (requestId) {
        logger.error(
            {
                requestId,
                error: errorMessage,
                stack: message instanceof Error ? message.stack : undefined,
                responseStatus: status,
            },
            "API error response",
        );
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * Wraps an API handler with error handling and logging
 * @param handler Async function that handles the API request
 */
export function withErrorHandling(
    handler: (req: Request, requestId: string) => Promise<Response>,
) {
    return async (req: Request): Promise<Response> => {
        const requestId = crypto.randomUUID();
        const url = new URL(req.url);
        logger.info(
            { requestId, path: url.pathname, method: req.method },
            "API request received",
        );

        try {
            return await handler(req, requestId);
        } catch (error) {
            return createErrorResponse(error, requestId);
        }
    };
}
