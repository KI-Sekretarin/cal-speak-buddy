// vite.config.ts
import { defineConfig } from "file:///Users/leolobmaier/Documents/Schule%20HTL%20Wels/5.Klasse/ITP/KI_Sekreta%CC%88rin/cal-speak-buddy/node_modules/vite/dist/node/index.js";
import react from "file:///Users/leolobmaier/Documents/Schule%20HTL%20Wels/5.Klasse/ITP/KI_Sekreta%CC%88rin/cal-speak-buddy/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///Users/leolobmaier/Documents/Schule%20HTL%20Wels/5.Klasse/ITP/KI_Sekreta%CC%88rin/cal-speak-buddy/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/Users/leolobmaier/Documents/Schule HTL Wels/5.Klasse/ITP/KI_Sekreta\u0308rin/cal-speak-buddy";
var vite_config_default = defineConfig(({ mode }) => ({
  // Use 0.0.0.0 to ensure the dev server binds to IPv4 interfaces as well
  // (binding to "::" can on some systems result in only an IPv6 listener,
  // which makes localhost (IPv4) connections fail). If you prefer to limit
  // to loopback only, set host to "127.0.0.1" instead.
  server: {
    host: "0.0.0.0",
    port: 8080
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbGVvbG9ibWFpZXIvRG9jdW1lbnRzL1NjaHVsZSBIVEwgV2Vscy81LktsYXNzZS9JVFAvS0lfU2VrcmV0YVx1MDMwOHJpbi9jYWwtc3BlYWstYnVkZHlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9sZW9sb2JtYWllci9Eb2N1bWVudHMvU2NodWxlIEhUTCBXZWxzLzUuS2xhc3NlL0lUUC9LSV9TZWtyZXRhXHUwMzA4cmluL2NhbC1zcGVhay1idWRkeS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbGVvbG9ibWFpZXIvRG9jdW1lbnRzL1NjaHVsZSUyMEhUTCUyMFdlbHMvNS5LbGFzc2UvSVRQL0tJX1Nla3JldGElQ0MlODhyaW4vY2FsLXNwZWFrLWJ1ZGR5L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICAvLyBVc2UgMC4wLjAuMCB0byBlbnN1cmUgdGhlIGRldiBzZXJ2ZXIgYmluZHMgdG8gSVB2NCBpbnRlcmZhY2VzIGFzIHdlbGxcbiAgLy8gKGJpbmRpbmcgdG8gXCI6OlwiIGNhbiBvbiBzb21lIHN5c3RlbXMgcmVzdWx0IGluIG9ubHkgYW4gSVB2NiBsaXN0ZW5lcixcbiAgLy8gd2hpY2ggbWFrZXMgbG9jYWxob3N0IChJUHY0KSBjb25uZWN0aW9ucyBmYWlsKS4gSWYgeW91IHByZWZlciB0byBsaW1pdFxuICAvLyB0byBsb29wYmFjayBvbmx5LCBzZXQgaG9zdCB0byBcIjEyNy4wLjAuMVwiIGluc3RlYWQuXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCldLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtYyxTQUFTLG9CQUFvQjtBQUNoZSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUt6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQzlFLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
