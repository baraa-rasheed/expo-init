import type { Route } from "./+types/api.module-details.$moduleId"
import { fetchModuleDetailsWithConfig } from "../../server/services/expoModuleFetcher"

export async function loader({ params }: Route.LoaderArgs) {
  const details = await fetchModuleDetailsWithConfig(params.moduleId)

  if (!details) {
    return Response.json(
      { error: "Module not found or failed to fetch" },
      { status: 404 }
    )
  }

  return Response.json(details)
}
