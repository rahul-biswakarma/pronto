export const Header = () => {
    return (
        <section className="flex flex-col gap-5 mt-8 md:mt-30 mb-12 z-10 px-4 text-center max-w-5xl">
            <h1 className="text-3xl md:text-7xl font-medium text-center mb-4 tracking-tight">
                Pick a template that matches your vibe.
            </h1>
            <p className="text-lg text-[var(--color-text-2)]">
                Each template is designed to highlight your strengths and bring
                your personality forward.
            </p>
        </section>
    );
};
