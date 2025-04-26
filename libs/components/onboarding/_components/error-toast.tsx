interface ErrorToastProps {
    message: string;
    onClose?: () => void;
}

export function ErrorToast({ message, onClose }: ErrorToastProps) {
    return (
        <div
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 fade-in"
            role="alert"
            aria-live="assertive"
            style={{ fontFamily: "var(--font-sans)" }}
        >
            <span className="text-sm font-medium">{message}</span>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="ml-2 px-2 py-1 rounded bg-[var(--color-destructive-foreground)] text-[var(--color-destructive)] text-xs font-bold hover:bg-[var(--color-destructive)] hover:text-[var(--color-destructive-foreground)] transition-colors"
                    aria-label="Close error notification"
                >
                    ×
                </button>
            )}
        </div>
    );
}
