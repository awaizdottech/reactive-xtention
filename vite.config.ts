import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFile } from "fs/promises";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-manifest",
      closeBundle: async () => {
        try {
          await copyFile(
            resolve(__dirname, "manifest.json"),
            resolve(__dirname, "dist/manifest.json")
          );
        } catch (error) {
          console.error("Failed to copy manifest.json", error);
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        // Main extension entry points
        popup: resolve(__dirname, "popup.html"),
        sidepanel: resolve(__dirname, "sidepanel.html"),

        // Background and content scripts
        background: resolve(__dirname, "src/background-scripts/index.ts"),
        contentScript: resolve(__dirname, "src/content-scripts/index.ts"),
      },
      output: {
        // Ensure each entry point gets its own output file
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") return "background.js";
          if (chunkInfo.name === "contentScript") return "content.js";
          if (chunkInfo.name === "popup") return "popup.js";
          if (chunkInfo.name === "sidepanel") return "sidepanel.js";
          return "[name].[hash].js";
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "popup.css") return "popup.css";
          if (assetInfo.name === "sidepanel.css") return "sidepanel.css";
          return "assets/[name].[ext]";
        },
      },
    },
    outDir: "dist",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@utils": resolve(__dirname, "./src/utils"),
    },
  },
});
