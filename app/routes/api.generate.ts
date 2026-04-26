import type { Route } from "./+types/api.generate"
import { generateProjectZipFromFormData } from "../../server/services/projectGenerator"

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const { headers, body } = await generateProjectZipFromFormData(formData)

  return new Response(body, { status: 200, headers })
}
