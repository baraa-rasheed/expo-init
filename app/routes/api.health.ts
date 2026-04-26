import type { Route } from "./+types/api.health"

export async function loader(_: Route.LoaderArgs) {
  return Response.json({ status: "ok", timestamp: new Date().toISOString() })
}
