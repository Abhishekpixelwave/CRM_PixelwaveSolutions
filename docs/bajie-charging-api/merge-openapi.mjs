import { readFileSync, readdirSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import yaml from "js-yaml"

const __dirname = dirname(fileURLToPath(import.meta.url))
const apisDir = join(__dirname, "apis")

const merged = {
  openapi: "3.0.1",
  info: {
    title: "Bajie Charging Open API",
    description:
      "Downloaded from https://s.apifox.cn/4855b8fe-4c43-48f6-8bd6-37cc29b98fe5",
    version: "1.0.0",
  },
  servers: [
    {
      url: "https://developer.chargenow.top/cdb-open-api/v1",
      description: "Production",
    },
    {
      url: "https://saas.dtoolsz.com/cdb-open-api/v1",
      description: "得兔-多货币",
    },
  ],
  paths: {},
  components: {
    schemas: {},
    securitySchemes: {
      basic: { type: "http", scheme: "basic" },
    },
  },
  security: [{ basic: [] }],
}

const files = readdirSync(apisDir)
  .filter((f) => f.endsWith(".md"))
  .sort()

const index = []

for (const file of files) {
  const content = readFileSync(join(apisDir, file), "utf8")
  const match = content.match(/```yaml\n([\s\S]*?)```/)
  if (!match) continue

  const spec = yaml.load(match[1])
  const titleMatch = content.match(/^# (.+)/m)
  const title = titleMatch?.[1] ?? file

  for (const [path, methods] of Object.entries(spec.paths ?? {})) {
    merged.paths[path] = { ...(merged.paths[path] ?? {}), ...methods }
    for (const method of Object.values(methods)) {
      method["x-apifox-source"] = file.replace(".md", "")
    }
  }

  if (spec.components?.schemas) {
    Object.assign(merged.components.schemas, spec.components.schemas)
  }

  index.push({ id: file.replace(".md", ""), title, paths: Object.keys(spec.paths ?? {}) })
}

writeFileSync(join(__dirname, "openapi.yaml"), yaml.dump(merged, { lineWidth: -1, noRefs: true }))
writeFileSync(join(__dirname, "openapi.json"), JSON.stringify(merged, null, 2))
writeFileSync(join(__dirname, "index.json"), JSON.stringify(index, null, 2))

console.log(`Merged ${files.length} APIs into openapi.yaml (${Object.keys(merged.paths).length} paths)`)
