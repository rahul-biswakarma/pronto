/**
 * Formats a domain string by converting to lowercase and removing special characters
 */
export function formatDomain(domain: string): string {
    return domain.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

/**
 * Checks if a domain meets the minimum requirements
 */
export function isDomainValid(domain: string): boolean {
    // Domain must be at least 3 characters long
    return domain.length >= 3;
}
