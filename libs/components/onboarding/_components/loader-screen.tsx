interface LoaderScreenProps {
    htmlPreview: string;
    isStreaming: boolean;
    progress?: number; // Optional, for animated dots or similar
}

export function LoaderScreen({ htmlPreview, isStreaming }: LoaderScreenProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-surface-0)]/90 backdrop-blur-sm fade-in"
            role="alertdialog"
            aria-modal="true"
            aria-label="Generating HTML, please wait"
        >
            <div className="flex flex-col items-center gap-8">
                {/* Animated Dots */}
                <div className="flex gap-2 mb-4" aria-hidden="true">
                    <span className="dot" />
                    <span className="dot delay-1" />
                    <span className="dot delay-2" />
                </div>
                {/* Preview Box */}
                <div
                    className="w-64 h-64 bg-[var(--color-surface-1)] rounded-xl shadow-xl border border-[var(--color-border-2)] flex items-center justify-center p-4 overflow-auto"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
                >
                    <pre
                        className="w-full h-full whitespace-pre-wrap text-[var(--color-text-2)]"
                        aria-live="polite"
                    >
                        {htmlPreview
                            ? htmlPreview.slice(-800)
                            : "Generating HTML..."}
                    </pre>
                </div>
                <span className="text-sm text-[var(--color-text-3)] mt-2">
                    Streaming HTML from AI... Please wait
                </span>
            </div>
        </div>
    );
}
