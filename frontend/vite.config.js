import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This allows access from other devices on the network
    port: 5173, // Optional: specify port explicitly

    proxy: {
      "/api": "http://localhost:5000", // Redirect API calls to backend
    },
  },
});
