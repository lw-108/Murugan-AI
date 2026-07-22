import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@bklitui/ui/charts": path.resolve(__dirname, "./src/components/ui/charts.tsx"),
      "@bklit/pie-chart": path.resolve(__dirname, "./src/components/ui/charts.tsx"),
      "@bklit/bar-chart": path.resolve(__dirname, "./src/components/ui/charts.tsx"),
    },
  },
})
