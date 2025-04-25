export const containerVariants = {
    closed: {
        width: "auto",
        borderBottom: "0px solid rgba(0, 0, 0, 0)",
        transition: {
            width: { duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] },
            borderBottom: { duration: 0.1, delay: 0 },
        },
    },
    open: {
        width: "400px",
        borderBottom: "1px solid var(--feno-border-1)",
        transition: {
            width: { duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] },
            borderBottom: { duration: 0.1, delay: 0.2 },
        },
    },
};

export const headerVariants = {
    closed: {
        borderBottom: "0px solid rgba(0, 0, 0, 0)",
        transition: {
            duration: 0.1,
            delay: 0,
        },
    },
    open: {
        borderBottom: "1px solid var(--feno-border-1)",
        transition: {
            duration: 0.1,
            delay: 0.2,
        },
    },
};

export const contentVariants = {
    initial: {
        height: 0,
        opacity: 0,
        marginTop: 0,
        marginBottom: 0,
        transformOrigin: "center top",
        scaleY: 0.8,
    },
    animate: {
        height: "auto",
        opacity: 1,
        marginTop: 8,
        marginBottom: 8,
        transformOrigin: "center top",
        scaleY: 1,
        transition: {
            height: { duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] },
            opacity: { duration: 0.3, delay: 0.1, ease: "easeInOut" },
            margin: { duration: 0.2, delay: 0.1 },
            scaleY: { duration: 0.3, ease: [0.19, 1.0, 0.22, 1.0] },
        },
    },
    exit: {
        height: 0,
        opacity: 0,
        marginTop: 0,
        marginBottom: 0,
        transformOrigin: "center top",
        scaleY: 0.8,
        transition: {
            height: { duration: 0.2, ease: [0.19, 1.0, 0.22, 1.0] },
            opacity: { duration: 0.15, ease: "easeInOut" },
            margin: { duration: 0.1 },
            scaleY: { duration: 0.2, ease: [0.19, 1.0, 0.22, 1.0] },
        },
    },
};
