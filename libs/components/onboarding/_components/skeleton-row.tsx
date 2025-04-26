interface SkeletonRowProps {
    count?: number;
}

export function SkeletonRow({ count = 4 }: SkeletonRowProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={`skeleton-${i}`}
                    aria-hidden="true"
                    className="animate-pulse w-64 min-w-[16rem] max-w-xs bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-border-1)] flex flex-col fade-in"
                    style={{
                        fontFamily: "var(--font-sans)",
                        scrollSnapAlign: "start",
                    }}
                >
                    <div className="w-full h-40 rounded-t-xl bg-[var(--color-surface-2)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-border-2)] to-transparent opacity-40 shimmer" />
                    </div>
                    <div className="flex flex-col gap-2 p-4">
                        <div className="h-5 w-2/3 bg-[var(--color-border-2)] rounded" />
                        <div className="h-4 w-full bg-[var(--color-border-2)] rounded" />
                        <div className="h-4 w-5/6 bg-[var(--color-border-2)] rounded" />
                    </div>
                </div>
            ))}
        </>
    );
}
