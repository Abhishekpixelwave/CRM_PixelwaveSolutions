# Bajie Charging API Documentation

Downloaded from [Apifox shared docs](https://s.apifox.cn/4855b8fe-4c43-48f6-8bd6-37cc29b98fe5) on 2026-06-02.

## Contents

| File | Description |
|------|-------------|
| `openapi.yaml` | Combined OpenAPI 3.0 spec (all endpoints) |
| `openapi.json` | Same spec in JSON format |
| `index.json` | API index with titles and path mappings |
| `apis/` | Individual endpoint docs from Apifox (35 files) |

## Base URLs

- Production: `https://developer.chargenow.top/cdb-open-api/v1`
- 得兔-多货币: `https://saas.dtoolsz.com/cdb-open-api/v1`

## Auth

1. Call `POST /oauth2/login` with SHA256-hashed password
2. Use returned token as `Authorization: Bearer <token>` for open-api requests

## Refresh

```bash
curl -sL "https://s.apifox.cn/4855b8fe-4c43-48f6-8bd6-37cc29b98fe5/sitemap.xml" | grep -oE 'api-[0-9]+' | sort -u | while read id; do
  curl -sL "https://s.apifox.cn/4855b8fe-4c43-48f6-8bd6-37cc29b98fe5/${id}.md" -o "apis/${id}.md"
done
npx --yes -p js-yaml node merge-openapi.mjs
```
