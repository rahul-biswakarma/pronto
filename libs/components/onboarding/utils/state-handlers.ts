import type { OnboardingState } from "../types";

/**
 * Sets the domain checking state
 */
export function setDomainCheckingState(
    state: OnboardingState,
): OnboardingState {
    return {
        ...state,
        domainStatus: {
            checking: true,
            available: null,
            message: "Checking availability...",
        },
    };
}

/**
 * Updates the domain status after checking
 */
export function updateDomainStatus(
    state: OnboardingState,
    available: boolean,
    message: string,
): OnboardingState {
    return {
        ...state,
        domainStatus: {
            checking: false,
            available,
            message,
        },
    };
}

/**
 * Resets the domain status
 */
export function resetDomainStatus(state: OnboardingState): OnboardingState {
    return {
        ...state,
        domainStatus: {
            checking: false,
            available: null,
            message: null,
        },
    };
}
