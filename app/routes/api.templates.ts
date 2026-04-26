import type { Route } from "./+types/api.templates"
import { getAllTemplates } from "../../server/services/templateFetcher"

export async function loader(_: Route.LoaderArgs) {
  const templates = await getAllTemplates()
  return Response.json(templates)
}
