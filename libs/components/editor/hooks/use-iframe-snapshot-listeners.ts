import { useEffect, useRef } from "react";

/**
 * Sets up mutation and user action listeners on an iframe's contentDocument, calling onChange on relevant events.
 * @param iframeRef - Ref to the target iframe
 * @param onChange - Callback invoked on DOM/user changes
 */
export function useIframeSnapshotListeners(
    iframeRef: React.RefObject<HTMLIFrameElement | null>,
    onChange: () => void,
) {
    const observerRef = useRef<MutationObserver | null>(null);
    const cleanupRef = useRef<() => void>(() => {});

    useEffect(() => {
        function attachListeners() {
            const iframe = iframeRef.current;
            if (!iframe?.contentDocument) return;
            const doc = iframe.contentDocument;

            // MutationObserver for DOM changes
            const observer = new MutationObserver(() => {
                onChange();
            });
            observer.observe(doc, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true,
            });
            observerRef.current = observer;

            // User action listeners
            const events = ["input", "keydown", "drop", "paste"] as const;
            for (const event of events) {
                doc.addEventListener(event, onChange, true);
            }

            // Cleanup function
            cleanupRef.current = () => {
                observer.disconnect();
                for (const event of events) {
                    doc.removeEventListener(event, onChange, true);
                }
            };
        }

        // Attach listeners if possible
        attachListeners();

        // Re-attach if iframe contentDocument changes
        const interval = setInterval(() => {
            const iframe = iframeRef.current;
            if (!iframe?.contentDocument) return;
            // If observer is not attached to the current doc, re-attach
            if (
                observerRef.current?.takeRecords?.() &&
                observerRef.current.takeRecords().length === 0 &&
                observerRef.current?.disconnect
            ) {
                // Already attached
                return;
            }
            // Clean up and re-attach
            cleanupRef.current();
            attachListeners();
        }, 1000);

        return () => {
            clearInterval(interval);
            cleanupRef.current();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [iframeRef, onChange]);
}
