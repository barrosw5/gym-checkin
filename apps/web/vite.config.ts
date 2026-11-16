/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            // Every API route lives under /api (same rule as in production)
            "/api": "http://localhost:3000",
        },
    },
    test: {
        // Pure logic (services, utils): no DOM needed, so the fast Node environment
        environment: "node",
        include: ["src/**/*.spec.ts"],
    },
});
