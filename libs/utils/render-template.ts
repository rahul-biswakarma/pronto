/**
 * Type for nested JSON structure
 */
type JSONValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | JSONObject
    | JSONArray;
interface JSONObject {
    [key: string]: JSONValue;
}
interface JSONArray extends Array<JSONValue> {}

/**
 * Parse a path string into an array of keys, handling both dot notation and bracket notation
 * Examples:
 * - "user.name" -> ["user", "name"]
 * - "items[0].title" -> ["items", "0", "title"]
 * - "data.items[0].values[1]" -> ["data", "items", "0", "values", "1"]
 */
function parsePath(path: string): string[] {
    // Replace bracket notation with dot notation: items[0] -> items.0
    const normalizedPath = path.replace(
        /\[(\d+|"[^"]+"|'[^']+')\]/g,
        (_, keyWithQuotes) => {
            // Remove quotes if they exist
            let keyValue = keyWithQuotes;
            if (
                (keyWithQuotes.startsWith('"') &&
                    keyWithQuotes.endsWith('"')) ||
                (keyWithQuotes.startsWith("'") && keyWithQuotes.endsWith("'"))
            ) {
                keyValue = keyWithQuotes.slice(1, -1);
            }
            return `.${keyValue}`;
        },
    );

    // Split by dots
    return normalizedPath.split(".").filter(Boolean);
}

/**
 * Access a nested value in an object using an array of keys
 * Handles both object properties and array indices
 * Returns undefined if the path doesn't exist or is invalid
 */
function getNestedValue(obj: JSONValue, keys: string[]): JSONValue {
    if (!obj || typeof obj !== "object") {
        return undefined;
    }

    let value: JSONValue = obj;

    for (const key of keys) {
        if (value === undefined || value === null) {
            return undefined;
        }

        if (Array.isArray(value)) {
            const index = Number.parseInt(key, 10);
            if (!Number.isNaN(index) && index >= 0 && index < value.length) {
                value = value[index];
            } else {
                // Try to access it as an object property in case this is an array of objects with named keys
                // This can happen in certain JSON structures
                if (
                    typeof key === "string" &&
                    value.length > 0 &&
                    typeof value[0] === "object"
                ) {
                    // If every item has this key, we can apply a map operation
                    if (
                        value.every(
                            (item) =>
                                item &&
                                typeof item === "object" &&
                                key in (item as JSONObject),
                        )
                    ) {
                        return value.map((item) => (item as JSONObject)[key]);
                    }
                }
                return undefined;
            }
        } else if (typeof value === "object") {
            value = (value as JSONObject)[key];
        } else {
            return undefined;
        }
    }

    return value;
}

/**
 * Handles complex array templates with nested arrays and objects
 * Enables rendering of arrays with relationships to other data
 */
function renderArraySection(
    template: string,
    arrayName: string,
    arrayValue: JSONArray,
    jsonData: JSONObject,
): string {
    if (!arrayValue || !Array.isArray(arrayValue) || arrayValue.length === 0) {
        return ""; // Remove section if array doesn't exist or is empty
    }

    // Handle nested array templates
    // Format: <!-- BEGIN nested_array parent_index --> ... <!-- END nested_array -->
    const nestedArrayPattern =
        /<!-- BEGIN ([a-zA-Z_\[\].]+) ([0-9]+) -->([\s\S]*?)<!-- END \1 -->/g;
    const processedTemplate = template.replace(
        nestedArrayPattern,
        (match, nestedArrayPath, parentIndexStr, nestedTemplate) => {
            const parentIndex = Number.parseInt(parentIndexStr, 10);

            // If this parent index doesn't match the current index, keep the template as is for later processing
            if (
                Number.isNaN(parentIndex) ||
                parentIndex < 0 ||
                parentIndex >= arrayValue.length
            ) {
                return "";
            }

            // Get the nested array using the path
            const nestedArrayKeys = parsePath(nestedArrayPath);
            const parentItem = arrayValue[parentIndex];

            if (!parentItem || typeof parentItem !== "object") {
                return "";
            }

            // Get the nested array from the parent item
            let nestedArray: JSONArray | undefined;

            if (nestedArrayKeys.length === 1) {
                // Direct property of parent
                nestedArray = (parentItem as JSONObject)[
                    nestedArrayKeys[0]
                ] as JSONArray;
            } else {
                // Nested property
                nestedArray = getNestedValue(
                    parentItem,
                    nestedArrayKeys,
                ) as JSONArray;
            }

            if (
                !nestedArray ||
                !Array.isArray(nestedArray) ||
                nestedArray.length === 0
            ) {
                return "";
            }

            // Process each item in the nested array
            return nestedArray
                .map((nestedItem, nestedIndex) => {
                    // Set up context for this nested item
                    const itemContext: JSONObject = {
                        ...jsonData,
                        item: nestedItem,
                        index: nestedIndex,
                        parent: parentItem,
                        parent_index: parentIndex,
                    };

                    // Add the array name as a direct reference to the current item
                    if (nestedArrayKeys.length === 1) {
                        itemContext[nestedArrayKeys[0]] = nestedItem;
                    }

                    // Replace placeholders
                    return replaceTemplatePlaceholders(
                        nestedTemplate,
                        itemContext,
                    );
                })
                .join("");
        },
    );

    // Replicate the template for each item in the main array
    return arrayValue
        .map((item: JSONObject, index: number) => {
            // Create a context that includes both the item and the full data
            const context: JSONObject = { ...jsonData };
            context[arrayName] = item;
            // Add index and item references
            context.index = index;
            context.item = item;

            // Replace placeholders in this item's template
            return replaceTemplatePlaceholders(processedTemplate, context);
        })
        .join("");
}

/**
 * Helper function to replace placeholders in a template with values from a context object
 */
function replaceTemplatePlaceholders(
    template: string,
    context: JSONObject,
): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const keys = parsePath(path.trim());
        const value = getNestedValue(context, keys);

        // Handle undefined, null, and empty values gracefully
        if (value === undefined || value === null) {
            // Return empty string instead of the placeholder to avoid showing {{placeholder}} in the UI
            return "";
        }

        return String(value);
    });
}

/**
 * Renders an HTML template by replacing placeholders with values from a JSON object
 * Placeholders can use either dot notation or bracket notation:
 * - {{user.name}} or {{user["name"]}}
 * - {{items.0.title}} or {{items[0].title}} or {{items[0]["title"]}}
 *
 * Also handles conditional sections based on the existence of data:
 * <!-- IF condition --> content <!-- ENDIF condition -->
 */
export function renderTemplate(
    htmlTemplate: string,
    jsonData: JSONObject,
): string {
    // Handle conditional sections
    // Format: <!-- IF condition --> content <!-- ENDIF condition -->
    const conditionalPattern =
        /<!-- IF ([^>]+) -->([\s\S]*?)<!-- ENDIF \1 -->/g;

    let renderedHtml = htmlTemplate.replace(
        conditionalPattern,
        (match, condition, content) => {
            const keys = parsePath(condition.trim());
            const value = getNestedValue(jsonData, keys);

            // Show content only if the condition exists and is truthy
            if (value) {
                // Process the content recursively to handle nested conditionals
                return renderTemplate(content, jsonData);
            }

            return ""; // Remove section if condition is falsy
        },
    );

    // Replace simple placeholders
    renderedHtml = replaceTemplatePlaceholders(renderedHtml, jsonData);

    // Handle array placeholders by searching for HTML comments with array indicators
    // Format: <!-- BEGIN array_name --> ... <!-- END array_name -->
    const arrayPattern =
        /<!-- BEGIN ([a-zA-Z_]+) -->([\s\S]*?)<!-- END \1 -->/g;

    renderedHtml = renderedHtml.replace(
        arrayPattern,
        (match, arrayName, template) => {
            // Check if the array exists in the data
            const arrayValue = jsonData[arrayName] as JSONArray | undefined;

            if (!arrayValue || !Array.isArray(arrayValue)) {
                // Try to look for the array in nested objects
                const nestedKeys = Object.keys(jsonData).filter(
                    (key) =>
                        typeof jsonData[key] === "object" &&
                        jsonData[key] !== null &&
                        !Array.isArray(jsonData[key]) &&
                        arrayName in (jsonData[key] as JSONObject),
                );

                if (nestedKeys.length > 0) {
                    // Use the first object that contains this array
                    const nestedArrayValue = (
                        jsonData[nestedKeys[0]] as JSONObject
                    )[arrayName] as JSONArray;
                    if (
                        Array.isArray(nestedArrayValue) &&
                        nestedArrayValue.length > 0
                    ) {
                        return renderArraySection(
                            template,
                            arrayName,
                            nestedArrayValue,
                            jsonData,
                        );
                    }
                }

                return ""; // Remove section if array doesn't exist
            }

            return renderArraySection(
                template,
                arrayName,
                arrayValue,
                jsonData,
            );
        },
    );

    return renderedHtml;
}
