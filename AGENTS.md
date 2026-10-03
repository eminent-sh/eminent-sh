# AGENTS.md — EMINENT

Shared instructions for AI coding agents in `eminent-sh`. This is EMINENT's public
portfolio, technical blog, and business website (`eminent.sh`), owned in the EMINENT
workspace context. Visitors browse published work; authenticated users manage content
through Payload. The repository is one Next.js application with its CMS and APIs.

## Architecture and boundaries

- **Runtime:** Next.js 15.4.11 App Router, React 19.2.1, Payload 3.82.1, TypeScript 5.7.3.
  Cloudflare **Workers** deployment uses OpenNext (locked to 1.19.11), D1/SQLite for
  content, and R2 for uploads. See `package.json` and `package-lock.json` for versions.
- **CMS source of truth:** `src/payload.config.ts` registers Users, Media, Posts,
  Projects, Categories, and Tags, plus the Lexical editor and plugins. Both content
  collections have autosaved drafts. Categories/tags are shared across blog and projects.
- **Single-site implementation:** the multi-tenant plugin and Tenants collection were
  removed; migrations retain that history. Users have no application roles or tenant
  memberships. Do not assume either exists from a generic Payload example.
- **Configured plugins:** R2 storage; SEO on posts only; form builder; redirects for
  posts/projects; MCP; Stripe; search indexing (posts priority 20, projects 10).
  Configured plugins are not proof of a complete public feature: contact currently uses
  a mailto link, and the header links to a hosted Stripe billing portal.
- **Frontend:** Server Components query Payload directly. Blog/project detail URLs are
  `/blog/post/[slug]` and `/projects/project/[slug]`; taxonomy filters use
  `/blog/category/[slug]`, `/blog/tag/[slug]`, and corresponding `/projects/` paths.
  Homepage, contact, and legal content is authored in source files.
- **Local/runtime split:** `next.config.ts` initializes local D1/R2 bindings with
  `remoteBindings: false`. Payload resolves the cached context, uses Wrangler for
  development/CLI, and OpenNext context in production Workers. Production CLI calls can
  enable remote bindings; importing the config is not a pure configuration read.

A representative flow is `Posts.ts` → Payload admin/REST → D1 (media in R2) →
`blog/page.tsx` and `PostCard.tsx` → `blog/post/[slug]/page.tsx` → Lexical rendering,
metadata, and adjacent-post navigation. Pages filter `_status: published`; existing
queries still omit the explicit Local API access boundary required below.

## Where to make changes

| Change | Source / exemplar |
| --- | --- |
| CMS fields and content model | `src/collections/Posts.ts`, `Projects.ts`; register in `src/payload.config.ts` |
| Blog listing/detail | `src/app/(frontend)/blog/page.tsx`, `blog/post/[slug]/page.tsx` |
| Portfolio listing/detail | `src/app/(frontend)/projects/page.tsx`, `projects/project/[slug]/page.tsx` |
| Shared presentation | `src/components/`; `PostCard.tsx`, `ProjectCard.tsx`, `Hero.tsx`, `ContentLayout.tsx` |
| Navigation, layout, analytics | `src/components/Header.tsx`, `Footer.tsx`, `src/app/(frontend)/layout.tsx` |
| Styling and UI primitives | `src/app/(frontend)/styles.css`, `src/components/ui/` (Tailwind 4, Radix) |
| Media display | `src/lib/featured-image.ts`, `Hero.tsx`; site-chrome images served from `public/` |
| Sitemap and origin | `src/app/sitemap.xml/route.ts`, `src/lib/sitemap.ts`, `src/utilities/getURL.ts` |
| Admin customization | Payload component registration; `src/app/(payload)/custom.scss` for admin styles |
| Database history | `src/migrations/` and `src/migrations/index.ts` |
| Tests | `tests/int/api.int.spec.ts`, `tests/e2e/*.e2e.spec.ts`, `tests/helpers/` |
| Deployment | `package.json`, `wrangler.jsonc`, `open-next.config.ts`, `next.config.ts` |

Payload-marked route/layout files in `src/app/(payload)/` are generated scaffolding.
`src/app/my-route/route.ts` is a starter response, not an application API exemplar.

## Setup and commands

Run commands at the repository root. Use npm and the checked-in lockfile;
`.npmrc` sets `legacy-peer-deps=true`. The manifest allows Node `^18.20.2 || >=20.9.0`,
but locked Wrangler/Vite/jsdom require newer versions. Node 24 LTS is a sensible
setup choice; see [toolchain evidence](docs/agent-context.md#toolchain-and-environment).

Copy `.env.example` to `.env` and set `PAYLOAD_SECRET` (generate with
`openssl rand -hex 32`). Set `SITE_URL` for sitemap/SEO, `ANALYTICS_ID` when enabling
GA4, and the Stripe keys documented in the example for that integration. Stripe is
configured unconditionally; startup with only a Payload secret has not been reverified.
Development D1/R2 are local emulations; no Docker service is configured. Site-chrome
images (heroes, logo, icons) are served from `public/`.

| Command | Purpose / prerequisites |
| --- | --- |
| `npm ci` | Install the checked-in dependency graph; `npm install` / `npm run ii` also exist |
| `npm run dev` | Next dev server, `http://localhost:3000`; admin at `/admin` |
| `npm run devsafe` | Clear `.next` and `.open-next`, then start dev |
| `npm run build` | Next production build with 8000 MB heap; not the Worker packaging step |
| `npm run start` | Serve the Next build locally; use preview for Worker-runtime checks |
| `npx tsc --noEmit` | TypeScript validation after code changes |
| `npm run lint` | `next lint` using `eslint.config.mjs` |
| `npm run test:int` | Vitest/jsdom; imports Payload config and uses D1 |
| `npm run test:e2e` | Playwright Chromium; starts/reuses port 3000 and admin tests write fixtures |
| `npm test` | Integration tests, then E2E tests |
| `npm run generate:types` | Cloudflare binding declarations, then Payload types |
| `npm run generate:types:cloudflare` | `wrangler types` → `cloudflare-env.d.ts` |
| `npm run generate:types:payload` | Payload types → `src/payload-types.ts` |
| `npm run generate:importmap` | Regenerate `src/app/(payload)/admin/importMap.js` |
| `npx payload migrate:create` | Generate a migration when a schema change requires it |
| `npm run preview` | OpenNext build followed by Wrangler preview; inspect environment/bindings first |

For focused checks, use `npm run test:int -- tests/int/api.int.spec.ts` or
`npm run test:e2e -- tests/e2e/frontend.e2e.spec.ts`. Install Playwright's browser
with `npx playwright install chromium` if absent. Tests load `.env` through dotenv;
`test.env` is not the configured fixture environment. Use local development bindings:
the admin helper deletes/recreates its test user, and Playwright reuses an existing server.

The frontend test still expects starter-template title/heading text. Prior instructions
reported a Vitest TextEncoder conflict and a config `realpath(...).endsWith(...)` crash;
these are historical reports with relevant code still present, not current test results.
Before interpreting failures, read [verification context](docs/agent-context.md#verification).

## Conventions

- Prettier: single quotes, no semicolons, trailing commas, 100-column width
  (`.prettierrc.json`). ESLint extends Next core-web-vitals and TypeScript rules;
  `no-explicit-any` is a warning. TypeScript is strict with `strictNullChecks: false`.
- Use `@/` for `src/` imports and `@payload-config` for the Payload config. Collections
  and React components use PascalCase; utilities/hooks use camelCase. Follow existing
  paths when extending a module.
- Import document types (including User/Post) from `@/payload-types`; import config,
  hook, access, field, and component types from `payload`. Narrow relationships that
  may be numeric IDs or populated documents; use field type guards instead of `any`.
- Keep Payload config/Local API on the server. Use Client Components for browser state
  and events; use existing frontend UI primitives rather than importing admin bundles.
- Use Payload's `_status` for publication and `slugField({ useAsSlug: 'title' })` as
  in Posts/Projects. `publishedAt` is currently a display/sort date, not a jobs runner.
- Admin component paths are relative to `src/` (`admin.importMap.baseDir`); named
  exports use `#ExportName`. Preserve configured plugin/field/hook arrays when extending.

## Security and data boundaries

1. Set `overrideAccess: false` for public/user-scoped Local API calls and permission
   tests, even when supplying a user. Only trusted, deliberately scoped administrative
   work may bypass access. Existing frontend calls are a known gap, not a precedent.
2. Pass `req` through every nested Local API operation in hooks. Guard recursive writes
   with a context flag, preserve other context, and return `doc` when skipping after-change
   work. This preserves identity/context; it does not make D1 multi-call writes atomic.
3. Default deny: validate IDs, data, ownership, and any approved future membership on
   the server. Field access returns booleans; read/update/delete collection access can
   return query constraints. Admin visibility and relationship filters are not access rules.
4. Posts/Projects define public reads limited to published documents and authenticated
   reads of all statuses. Media/Categories/Tags define public reads. No application-wide
   roles or tenant isolation are configured; existing access changes require review below.
5. Use the existing D1 adapter/R2 bindings. `transactionOptions` is not configured;
   verify exact adapter/runtime support before designing transactions. Do not substitute
   MongoDB/Postgres patterns or a local database-URL recipe.
6. Never commit `.env` or credentials. Use Cloudflare Secrets for production secrets and
   keep sensitive config out of client bundles. Logs must not expose secrets.

## Agent behavior

### Required checks and generation

- Run `npm run generate:types` after collection/global schema changes; use
  `npm run generate:types:payload` if the Cloudflare generation step is unavailable.
- Run `npm run generate:importmap` after creating/modifying admin components.
- Run `npx tsc --noEmit` after code changes and `npm run lint` before suggesting a commit.
- Use `npx payload migrate:create` for persistent schema changes that need migrations.
- Do not manually edit `src/payload-types.ts`, `src/payload-generated-schema.ts` if
  generated, or the admin import map. Edit their source configuration and regenerate.

### Ask first

- Database migrations that alter existing columns or drop data.
- Adding Payload plugins or large dependencies. Keep Worker bundle size in mind;
  verify the actual plan's limits rather than assuming a universal 3 MB cap.
- Changes to `wrangler.jsonc` bindings or Cloudflare configuration.
- Modifying access control on existing collections.

Never run `npm run deploy` without explicit user confirmation. The existing destructive
migration and infrastructure review boundaries also apply to the scripts below.

## Deployment and Git workflow

- `npm run deploy` runs `deploy:database` then `deploy:app` (OpenNext build + deploy).
- `npm run stage` runs the **same database migration step**, then `deploy:upload`
  (OpenNext build + upload). It is not an isolated staging environment.
- `deploy:database` sets `NODE_ENV=production`, runs Payload migrations, then executes
  remote D1 `PRAGMA optimize`. Default Worker/D1/R2 names are `eminent-sh`.
- `CLOUDFLARE_ENV` selects a configured environment, but `wrangler.jsonc` contains only
  a commented staging example. An environment name alone does not establish isolation.
- Worker artifacts are `.open-next/worker.js` and `.open-next/assets`; the config enables
  `nodejs_compat` and `global_fetch_strictly_public`. No repository CI workflow is present.
  Production deployment/migration state and branch automation need external confirmation.
- Use descriptive branches (`feat/add-blog-collection`, `fix/login-styles`), Conventional
  Commits (`feat:`, `fix:`, `chore:`), and focused PRs with tests for new functionality.

## Read when relevant

- Before Payload implementation work, read the matching sections of
  [Payload reference](docs/payload-reference.md), including access and hook boundaries.
  Optional recipes do not establish implemented features or authorization policies.
- Before changing persistence/deploy behavior, read
  [deployment and persistence context](docs/agent-context.md#deployment-and-persistence).
- Before routing, SEO, test, or integration changes, read the
  [implementation gaps](docs/agent-context.md#implementation-gaps) and source evidence.
- For setup, start with [README.md](README.md). For future context refreshes, update
  [the maintenance record](docs/agent-context.md#maintenance-record) with actual evidence
  and distinguish source-confirmed behavior from executed checks and owner decisions.
