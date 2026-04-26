import type { Route } from "./+types/api.expo-modules"
import { getExpoModules } from "../../server/services/expoModuleFetcher"

export async function loader(_: Route.LoaderArgs) {
  const modules = await getExpoModules()
  return Response.json(modules)
}
