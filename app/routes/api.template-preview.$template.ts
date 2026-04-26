import type { Route } from "./+types/api.template-preview.$template"
import { exec } from "node:child_process"
import { promisify } from "node:util"
import fs from "node:fs/promises"
import path from "node:path"
import os from "node:os"

const execAsync = promisify(exec)

interface CachedPreview {
  appJson: unknown
  packageJson: unknown
  timestamp: number
}

const templateCache: Record<string, CachedPreview> = {}
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

function templateToCreateExpoAppArg(template: string) {
  return template === "default-sdk-55" ? "default@sdk-55" : template
}

export async function loader({ params }: Route.LoaderArgs) {
  const template = params.template

  try {
    const cached = templateCache[template]
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return Response.json(cached)
    }

    const tempDir = path.join(os.tmpdir(), "expo-init-preview", `template-${Date.now()}`)
    await fs.mkdir(tempDir, { recursive: true })

    const projectName = "preview-project"
    const templateArg = templateToCreateExpoAppArg(template)

    await execAsync(
      `npx create-expo-app@latest ${projectName} --template ${templateArg} --no-install`,
      { cwd: tempDir, timeout: 60_000 }
    )

    const projectDir = path.join(tempDir, projectName)

    let appJson: unknown = {}
    try {
      appJson = JSON.parse(await fs.readFile(path.join(projectDir, "app.json"), "utf-8"))
    } catch {
      appJson = {}
    }

    let packageJson: unknown = {}
    try {
      packageJson = JSON.parse(await fs.readFile(path.join(projectDir, "package.json"), "utf-8"))
    } catch {
      packageJson = {}
    }

    setTimeout(() => {
      fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
    }, 5000)

    const result: CachedPreview = { appJson, packageJson, timestamp: Date.now() }
    templateCache[template] = result

    return Response.json(result)
  } catch (error) {
    return Response.json(
      {
        error: "Failed to fetch template preview",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
