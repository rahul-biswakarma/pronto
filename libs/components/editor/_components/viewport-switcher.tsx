"use client";
import type { DeviceType } from "../types";

interface ViewportSwitcherProps {
    deviceType: DeviceType;
    onDeviceChange: (device: DeviceType) => void;
}

export const ViewportSwitcher = ({
    deviceType,
    onDeviceChange,
}: ViewportSwitcherProps) => {
    const handleToggleDevice = () => {
        // Cycle through device types: desktop → tablet → mobile → desktop
        const nextDevice: Record<DeviceType, DeviceType> = {
            desktop: "tablet",
            tablet: "mobile",
            mobile: "desktop",
        };

        onDeviceChange(nextDevice[deviceType]);
    };

    return (
        <button
            type="button"
            className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl"
            onClick={handleToggleDevice}
            title={`Current: ${deviceType} view - Click to toggle`}
        >
            {deviceType === "desktop" && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary size-5"
                >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
            )}
            {deviceType === "tablet" && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary size-5"
                >
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12" y2="18" />
                </svg>
            )}
            {deviceType === "mobile" && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary size-5"
                >
                    <rect x="6" y="2" width="12" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12" y2="18" />
                </svg>
            )}
        </button>
    );
};
