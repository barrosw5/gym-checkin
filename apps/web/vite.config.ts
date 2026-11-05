import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // Any request starting with /auth or /health or /gym goes to NestJS
            "/auth": "http://localhost:3000",
            "/health": "http://localhost:3000",
            "/gym": "http://localhost:3000",
        },
    },
});
