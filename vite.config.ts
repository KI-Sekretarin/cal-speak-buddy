import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use 0.0.0.0 to ensure the dev server binds to IPv4 interfaces as well
  // (binding to "::" can on some systems result in only an IPv6 listener,
  // which makes localhost (IPv4) connections fail). If you prefer to limit
  // to loopback only, set host to "127.0.0.1" instead.
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      clientPort: 8080,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
