import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    webpack: (config) => {
        // Enable WebAssembly
        config.experiments = { ...config.experiments, asyncWebAssembly: true };

        // Handle PDF.js worker and related files
        config.module.rules.push({
            test: /\.(wasm)$/i,
            type: "asset/resource",
        });

        return config;
    },
};

export default nextConfig;
