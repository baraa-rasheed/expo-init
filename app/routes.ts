import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  // API
  route("/api/health", "routes/api.health.ts"),
  route("/api/templates", "routes/api.templates.ts"),
  route("/api/template-preview/:template", "routes/api.template-preview.$template.ts"),
  route("/api/expo-modules", "routes/api.expo-modules.ts"),
  route("/api/module-details/:moduleId", "routes/api.module-details.$moduleId.ts"),
  route("/api/generate", "routes/api.generate.ts"),

  // UI
  index("routes/home.tsx"),
] satisfies RouteConfig
