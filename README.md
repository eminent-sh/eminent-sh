# EMINENT

Source for [eminent.sh](https://eminent.sh), EMINENT's portfolio, technical blog, and
business website. Built from Payload's
[Cloudflare D1 template](https://github.com/payloadcms/payload/tree/main/templates/with-cloudflare-d1).

The app uses Next.js 15.4.11, React 19.2.1, and Payload 3.82.1. Deployment is configured
for Cloudflare Workers through OpenNext, with D1/SQLite content storage and R2 uploads.
Payload manages users, media, posts, projects, categories, and tags. Posts and projects
support autosaved drafts; the current application is single-site.

## Local setup

Use npm and the checked-in `package-lock.json`. `.npmrc` enables `legacy-peer-deps`.
Node 24 LTS is a recommended starting point: the older minimum in `package.json`
does not cover the requirements of all locked development dependencies.

Run from the repository root:

```bash
npm ci
cp .env.example .env
openssl rand -hex 32
```

Put the generated value in `.env` as `PAYLOAD_SECRET`, then review these settings:

| Variable | Use |
| --- | --- |
| `PAYLOAD_SECRET` | Payload authentication/encryption secret |
| `SITE_URL` | Site origin for sitemap and SEO; use `http://localhost:3000` locally |
| `ANALYTICS_ID` | Optional GA4 measurement ID |
| `STRIPE_SECRET_KEY` | Required by the configured Stripe integration, as noted in `.env.example` |
| `STRIPE_WEBHOOKS_ENDPOINT_SECRET` | Stripe webhook verification secret |

The Stripe plugin is configured unconditionally. A clean startup with only a Payload
secret has not been verified in the latest context review. Keep credentials out of Git;
production secrets belong in Cloudflare Secrets.

```bash
npm run dev
```

Open `http://localhost:3000` and `/admin` for the CMS. The Next dev configuration
disables remote bindings and initializes local D1/R2 emulation automatically. Docker
and a separate database server are not configured. Shared hero images and icons are
served from `public/`.

## Development and verification

| Command | Purpose |
| --- | --- |
| `npm run devsafe` | Clear Next/OpenNext build output and start development |
| `npx tsc --noEmit` | Check TypeScript |
| `npm run lint` | Run the configured Next/ESLint checks |
| `npm run test:int` | Run Vitest integration tests using the Payload config |
| `npm run test:e2e` | Run Playwright Chromium tests; starts or reuses the dev server |
| `npm run build` | Build Next.js; Worker packaging is a separate OpenNext step |
| `npm run generate:types` | Regenerate Cloudflare and Payload declarations |
| `npm run generate:importmap` | Regenerate the Payload admin component map |

Install the browser with `npx playwright install chromium` if needed. Admin E2E tests
create/delete a fixture user; run them against local development data. The frontend
spec still asserts starter-template content. Historical integration/admin failures and
the actual checks performed are recorded in
[verification context](docs/agent-context.md#verification).

For implementation guidance and the complete command map, read [AGENTS.md](AGENTS.md).
The [project context](docs/agent-context.md) explains content flow, configuration,
known source discrepancies, and maintenance provenance.

## Deployment

`wrangler.jsonc` targets the `eminent-sh` Worker, D1 database, and R2 bucket.
Authenticate the appropriate EMINENT Cloudflare account for remote operations
(`npx wrangler login` for interactive Wrangler authentication).

Review schema changes and generate any required migration with
`npx payload migrate:create` before deployment. Database-altering operations and
infrastructure changes follow the review boundaries in [AGENTS.md](AGENTS.md#agent-behavior).

- `npm run deploy`: run database migrations and remote D1 optimization, then build
  and deploy the Worker. Agents require explicit user confirmation.
- `npm run stage`: run **the same database step**, then build and upload a Worker
  version. This command does not provide an isolated staging database.
- `npm run preview`: build with OpenNext, then run the Worker preview. Review binding
  selection before treating this as a local-only operation.

`CLOUDFLARE_ENV` selects an existing Wrangler environment. The checked-in staging
configuration is only a commented example; no separate staging environment is defined.
Branch-to-deployment automation and the current live migration state are unverified.
See [deployment context](docs/agent-context.md#deployment-and-persistence) before operating.

## Runtime notes

- `src/payload.config.ts` installs a JSON console logger in all environments. The prior
  template notes explain its purpose as avoiding Workers-incompatible `pino-pretty`
  behavior. `PAYLOAD_LOG_LEVEL` sets its `level` property; its custom methods directly
  call `console.*`, so do not assume they implement level filtering.
- Worker log collection is configured externally; check the
  [Cloudflare observability documentation](https://developers.cloudflare.com/workers/observability/logs/workers-logs/).
- Media disables cropping/focal-point processing because of Workers image-processing
  constraints. `skipSafeFetch` is not configured in the current Media collection.
- The starter documentation recommended a paid Worker plan for bundle size and noted
  a [GraphQL/workerd issue](https://github.com/cloudflare/workerd/issues/5175). Treat
  those as historical notes: verify the current runtime and
  [plan-specific bundle limits](https://developers.cloudflare.com/workers/platform/limits/#worker-size)
  when deploying or expanding dependencies.
