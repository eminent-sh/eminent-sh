# EMINENT project context

This is the source-backed context and maintenance record for `eminent-sh`. Read
[AGENTS.md](../AGENTS.md) for standing instructions and
[Payload reference](payload-reference.md) for detailed implementation patterns.
Source paths below are relative to the repository root.

## Identity and foundational decisions

- **Scope:** a single Next.js/Payload codebase for EMINENT's portfolio, technical blog,
  and business website. The frontend identifies EMINENT MEDIA LLC and advertises
  DevOps, software, and website services. Public visitors and CMS authors are the two
  implemented user contexts (`layout.tsx`, `Hero.tsx`, `Users.ts`).
- **Organization:** EMINENT, as established by the development workspace instructions,
  the `eminent-sh/eminent-sh` Git remote, and application branding. M3 accounts and
  infrastructure are outside this project context.
- **Existing project policy, retained:** shared cross-agent guidance; D1/R2/OpenNext
  architecture; generated-type/import-map requirements; explicit Local API access;
  review for access changes, destructive migrations, plugins/large dependencies, and
  Cloudflare configuration; explicit confirmation for deployment; Conventional Commits.
  These policies predate this review rather than being inferred from source examples.
- **Source-confirmed implementation:** multi-tenancy was removed from configuration,
  dependencies, and generated document types. The May 2026 migrations retain removal
  and foreign-key repair history. The business rationale for removing tenancy is not
  recorded; source establishes current behavior, not a permanent product prohibition.
- **User-confirmed session purpose:** bootstrap/reconcile project documentation and
  retain this conversation as the project's context-maintenance session. No additional
  product requirements or implementation changes were requested.

## Evidence map

Reviewed on **2026-09-22**. These are source-confirmed unless explicitly marked observed
or historical; they do not establish that the application or remote deployment passed checks.

| Fact | Inspected evidence |
| --- | --- |
| Toolchain, commands, locked versions | `package.json`, `package-lock.json`, `.npmrc` |
| CMS registration, plugins, D1/R2, custom logger | `src/payload.config.ts` (`buildConfig`, `resolveCloudflareContext`, `getCloudflareContextFromWrangler`) |
| Local binding initialization and image allowlist | `next.config.ts` (`initOpenNextCloudflareForDev`, `withPayload`) |
| Worker artifacts and resources | `wrangler.jsonc`, `open-next.config.ts`, deployment scripts |
| Six authored collections, draft/public-read model | All six files in `src/collections/`; generated `Config` and `User` in `src/payload-types.ts` |
| Product branding and public contact behavior | `src/app/(frontend)/layout.tsx`, `page.tsx`, `contact/page.tsx`, `src/components/Hero.tsx`, `Header.tsx` |
| Blog data/rendering flow | `src/app/(frontend)/blog/page.tsx`, `blog/post/[slug]/page.tsx`, `src/components/PostCard.tsx` |
| Portfolio rendering and metadata | `src/app/(frontend)/projects/project/[slug]/page.tsx`, `src/collections/Projects.ts` |
| Sitemap links and origin precedence | `src/lib/sitemap.ts`, `src/app/sitemap.xml/route.ts`, `src/utilities/getURL.ts` |
| Admin/REST integration is generated scaffolding | `src/app/(payload)/layout.tsx`, `src/app/(payload)/api/[...slug]/route.ts` |
| Migration sequence and tenant repairs | `src/migrations/index.ts`, `20260531_010000_remove_multi_tenant.ts`, `20260531_020000_fix_locked_documents_tenant_fk.ts`, `20260531_030000_strip_tenant_fk_from_posts_projects.ts` |
| MCP create-permission column repair | `src/migrations/20260531_021000_mcp_api_key_create_columns.ts` |
| Actual test scope and fixture writes | `vitest.config.mts`, `vitest.setup.ts`, `playwright.config.ts`, all three specs, `tests/helpers/seedUser.ts`, `login.ts` |
| Code style and generated-file exclusions | `.prettierrc.json`, `eslint.config.mjs`, `tsconfig.json`, `.gitignore` |

## Representative content flow

1. An author edits a Post in Payload admin. `Posts.ts` requires a title, rich-text body,
   category, and author; its slug uses `slugField`. Optional tags/media are relationships.
   Both Posts and Projects enable draft autosave and publication through `_status`.
2. The shared Payload configuration attaches the D1 adapter, R2 storage, and plugins.
   SEO adds `meta` to posts only. Search indexes posts/projects with different priorities;
   MCP enables all configured post/project operations and find/create for taxonomy/media.
3. `/blog` obtains Payload server-side, queries published posts and categories in
   parallel, sorts by `-publishedAt`, and paginates ten posts. `PostCard` links to
   `/blog/post/${slug}`. The detail route queries the published slug at depth 2,
   calls `notFound()` if absent, renders Lexical with heading IDs/table of contents,
   and loads previous/next posts by publication date. Metadata uses a separate query.
4. Projects follow a similar flow at `/projects/project/${slug}`, with repository/live
   URL actions and metadata derived from title/excerpt/image. Public taxonomy pages
   share the same Categories/Tags collections across both content types.
5. `/sitemap.xml` gathers static paths and published content via `src/lib/sitemap.ts`;
   it emits XML with one-day cache headers and the correct detail-route segments.

Collection `read` rules and explicit published filters are distinct: these frontend and
sitemap Local API queries currently omit `overrideAccess: false`. The existing integration
smoke test also bypasses access by default. None is a permission-test exemplar.
Changes to existing collection access follow the standing review requirement.

For a new displayed Post field, start in `Posts.ts`, regenerate types/create a migration
when required, then update `PostCard` and/or the detail route and its metadata selection.
For a URL change, also examine `PostNavigation`, `ProjectCard`, taxonomy links, the
sitemap builder, and SEO `generateURL`. Browser regressions belong in `tests/e2e/`;
API/access regressions belong in `tests/int/` and must explicitly enforce access.

## Toolchain and environment

The manifest and lockfile root dependency maps agree. There is one npm package and one
npm lockfile (v3); no package-manager field or Node version pin is present. Locked
versions include Next 15.4.11, React 19.2.1, Payload 3.82.1, OpenNext 1.19.11,
Wrangler 4.61.1, TypeScript 5.7.3, Vitest 4.0.18, and Playwright 1.58.2.

The root Node engine (`^18.20.2 || >=20.9.0`) is broader than the locked toolchain:
Wrangler requires Node >=20; jsdom 28 requires `^20.19.0 || ^22.12.0 || >=24.0.0`;
Vite 7.3.3 requires `^20.19.0 || >=22.12.0`. Node 24 LTS is a setup recommendation,
not a tested project pin. The local review host reported Node v26.8.2/npm 11.19.1.

Environment names come from `.env.example` and source, not from reading credentials:

| Variable | Source / precedence |
| --- | --- |
| `PAYLOAD_SECRET` | `payload.config.ts`; falls back to an empty string, which is not a usable setup secret |
| `SITE_URL` | Preferred site origin in both sitemap helper and SEO generator |
| `NEXT_PUBLIC_SITE_URL` | Secondary origin in both; not listed in `.env.example` |
| `VERCEL_PROJECT_PRODUCTION_URL` | Legacy fallback in `getServerSideURL` only, followed by `http://localhost:3000`; not evidence of a Vercel deployment |
| `ANALYTICS_ID` | Frontend layout conditionally loads GA4 |
| `STRIPE_SECRET_KEY` | Unconditionally registered Stripe plugin; `.env.example` labels it required |
| `STRIPE_WEBHOOKS_ENDPOINT_SECRET` | Passed to Stripe plugin for webhook verification |
| `PAYLOAD_LOG_LEVEL` | Custom logger's `level` property, default `info`; custom methods do not themselves filter |
| `CLOUDFLARE_ENV` | Wrangler/OpenNext environment selection; no active named staging config in the repository |
| `NODE_ENV` | Selects local versus production binding bootstrap; deployment database script sets `production` |

SEO's final origin fallback is `https://example.com`, unlike the sitemap helper's local
fallback. Set `SITE_URL` deliberately for each actual runtime. Wrangler authentication
is needed for remote operations; the dev initialization explicitly disables remote
bindings. `generate:types:cloudflare` runs local `wrangler types`; the script does not
establish the old documentation's claim that this step always requires login.

## Deployment and persistence

- `wrangler.jsonc` names the Worker, D1 database, and R2 bucket `eminent-sh`; D1 has
  `remote: true`, and R2's preview bucket name equals its regular bucket name. The
  configured entrypoint/assets are `.open-next/worker.js` and `.open-next/assets`.
  Compatibility date is `2025-08-15` with Node compatibility and public-only fetch flags.
- `next.config.ts` forces local bindings in development. Payload first checks a cached
  Cloudflare context; otherwise production non-CLI resolves OpenNext context, while
  development/CLI calls Wrangler's platform proxy with `remoteBindings: isProduction`.
  Commands importing Payload config can therefore initialize services. The unguarded
  CLI detection is a separate known gap below.
- `deploy` = database migrations/optimization → OpenNext build/deploy. `stage` = the
  same database step → OpenNext build/upload. `deploy:database` supplies
  `NODE_ENV=production PAYLOAD_SECRET=ignore` to `payload migrate`, then explicitly
  runs remote D1 `PRAGMA optimize`. The migration placeholder is not a deployment secret.
- App deploy/upload scripts pass `--env=$CLOUDFLARE_ENV` to both build and release.
  `preview` passes it to preview but not explicitly to its build command. Review the
  selected bindings before using these scripts; the commented staging example creates
  no actual isolation. No tracked GitHub/other CI configuration was found.
- The migration index orders the initial schemas, plugin additions, tenant removal,
  locked-document FK repair, MCP create columns, and post/project FK repairs. Repair
  comments explain that optional `ALTER TABLE ... DROP COLUMN` calls had swallowed
  errors, leaving foreign keys to the removed tenants table. The final repair rebuilds
  content/version tables and has an empty `down` migration. Preserve this history and
  inspect D1 semantics when generating future changes; it is not proof of live DB state.
- The D1 adapter has no configured `transactionOptions` or read replicas. Do not
  infer multi-operation atomicity from `req` propagation or copy standalone SQLite
  transaction configuration without checking adapter support.
- R2 storage maps `media` directly. `Media.ts` requires alt text and disables crop and
  focal point because of Workers processing limitations. No email adapter is configured.

## Implementation gaps

These are documentation-relevant source discrepancies, not implemented fixes or a new
feature mandate. Revalidate the affected source before addressing one.

| Gap | Evidence / next verification |
| --- | --- |
| Public Local API queries omit the required access option | Blog/project pages and `src/lib/sitemap.ts`; assess anonymous relationship/field reads as well as document status when correcting |
| SEO-generated post URL omits `/post/` | `payload.config.ts` uses `/blog/${slug}`; routes, cards, and sitemap use `/blog/post/${slug}` |
| Projects' admin description claims plugin SEO fields | `Projects.ts` says this, but SEO is registered only for posts and project metadata uses ordinary fields |
| Stored JSON-LD is not emitted by detail pages | Both collections define `schema`; inspected detail components never render it despite the field descriptions |
| Publication dates are not scheduled publishing | `publishedAt` fields have no publication hook/jobs configuration and public filters use `_status`, without a time cutoff |
| Cache declarations need runtime-specific interpretation | Content routes set both `dynamic = 'force-dynamic'` and `revalidate = 86400`; no custom publication revalidation hooks are registered |
| Starter tests have drifted | Frontend test expects `Payload Blank Template` and `Welcome to your new project.`; layout/Hero render EMINENT branding |
| CLI detection can dereference undefined | `realpath` returns undefined for nonexistent paths; `process.argv.some` calls `.endsWith` without a guard |
| Plugin registration exceeds demonstrated frontend integration | Contact is mailto; no public form/search/checkout flow or redirect consumer was found in the inspected routes/config; header provides a hosted billing link |
| Package description remains starter text | `package.json` still says a blank Payload template; README now describes the actual project |

The old README's production-only logger and `skipSafeFetch: true` claims were contradicted
by source. The JSON console logger is always configured; Media has no `skipSafeFetch`.
Historical notes about `pino-pretty`/Workers errors, undici diagnostic-channel errors,
[GraphQL compatibility](https://github.com/cloudflare/workerd/issues/5175), and paid-plan
bundle requirements were not reproduced or revalidated remotely. They are investigation
leads, not reasons to change transport or security settings automatically. The old
read-replica recipe described an optional capability, not the current D1 configuration.

## Verification

Commands in AGENTS/README were checked against scripts and configuration. Their presence
does not imply execution. The last context review was documentation-only.

| Check | Result on 2026-09-22 |
| --- | --- |
| Git boundary/status/remote/worktree inspection | Observed one main worktree, branch `preview` tracking `origin/preview`, remote `https://github.com/eminent-sh/eminent-sh.git`, HEAD `e4a3a25d76aacf419be9c07029ad3b654d0114ff` |
| Dependency graph metadata | Parsed manifest/lock; root dependency maps matched; inspected engines/resolved versions without installation |
| Local prerequisites | Observed no `node_modules` and no `.env`; Node/npm versions recorded above |
| Documentation validation | Passed `git diff --check`; a local Python check validated 41 relative links/anchors, balanced fences, and referenced npm script names; source paths and the preservation diff were reviewed |
| Existing work preservation | File hashes confirmed only AGENTS/README changed among pre-existing tracked files; all 13 prior Cursor-rule deletions were preserved; two supporting docs were added |
| App execution | Dev server, build, TypeScript, lint, Vitest, and Playwright not run: dependencies/configuration absent and no application code changed |
| Remote operations | No deployment, migration execution, authentication probe, or production/runtime verification performed |

### Test scope and historical reports

- Integration: `vitest.config.mts` uses jsdom and `vitest.setup.ts` loads `.env`.
  `tests/int/api.int.spec.ts` only checks that a users find returns a defined result;
  it does not test access, content rendering, or publication behavior.
- E2E: Chromium only; `playwright.config.ts` starts `npm run dev` and always allows
  reuse of an existing server on port 3000. Admin helpers directly import the Payload
  config, delete an existing fixture user, create it, and delete it after tests. Keep
  that execution on local development bindings. `test.env` only defines `NODE_OPTIONS`
  and is not loaded by the current dotenv setup.
- **Historical/unverified:** prior agent instructions reported the jsdom/esbuild
  TextEncoder conflict, admin setup crashes through `realpath`, and lint passing with
  warnings. Dates/output were not retained; do not present them as fresh test results.
  The frontend title/heading mismatch and unsafe CLI-detection expression are separately
  source-confirmed. Prior 10–20 second first-load timing is also unverified here.
- After installing/configuring locally, the smallest existing checks are
  `npm run test:int -- tests/int/api.int.spec.ts` and
  `npm run test:e2e -- tests/e2e/frontend.e2e.spec.ts`. These will need the existing
  setup/content issues considered. Use `npx tsc --noEmit` and `npm run lint` for code
  changes, then relevant integration/browser regressions; a green smoke test is not
  permission coverage.

## Remaining owner context

1. Which branch/build service currently deploys production? The local `preview` branch
   and npm `stage` command do not establish an automatic deployment relationship.
2. Is there a separate staging environment outside this repository? No active named
   staging environment or separate preview bucket is configured here.
3. Where are runtime variables and integration credentials provisioned for each actual
   environment, and which Stripe/form/search/redirect capabilities are intended to be
   public? Configuration is inspectable locally; live provisioning/product intent is not.

## Maintenance record

### 2026-09-22 — bootstrap/reconciliation

- Scope: active EMINENT repository, including existing instructions, README, manifests,
  configs, representative frontend/CMS flows, generated type shape, tests, and migration
  history. No parent workspace documentation was changed.
- Starting worktree already had an edited `AGENTS.md` and 13 deleted `.cursor/rules/`
  files. The existing consolidation of Payload guidance was preserved in
  `docs/payload-reference.md`; essential policies remain in the shorter root guide.
  Deleted Cursor files were not restored. No nested AGENTS, CLAUDE/GEMINI, or other
  active editor instruction files were found in the project.
- Reconciled false tenancy, route, integration, logger, setup, and test-status claims;
  replaced starter README orientation; recorded unresolved source/runtime differences.
  Detailed Payload recipes remain optional reference material, not feature commitments.
- Verification and limitations are recorded above. Future refreshes should change this
  record only for meaningful new evidence and preserve the original session pointer.
- Bootstrap/maintenance session ID: `ses_f33c41112ffe1pGqDHjx7F8Tbl` (local OpenCode
  provenance, not a portable URL). Durable project understanding lives in these files.

### 2026-10-03 — R2-to-public migration and Worker Previews adoption

- Verified the `eminent-sh` R2 bucket holds exactly 15 objects; all now live in
  `public/` with matching byte sizes, and Hero/Header/layout metadata plus
  `featured-image.ts` serve them locally. `next.config.ts` remote image patterns
  removed. New CMS uploads still target R2 via `/api/media/file`.
- `payload.config.ts` resolves local (not remote) bindings when
  `NEXT_PHASE=phase-production-build`; `npm run build` runs local
  `payload migrate` first so prerendered queries hit a migrated schema. Runtime
  and CLI binding behavior unchanged.
- Adopted Worker Previews (one-time, irreversible): Wrangler ~4.61 → ~4.147,
  `wrangler.jsonc` `previews` block binds staging D1/R2 `eminent-sh-preview`
  (schema seeded 2026-10-03; re-seed after future schema changes), preview
  `PAYLOAD_SECRET` in Previews base config, `npm run preview:deploy` wraps the
  opennext build plus `wrangler preview`. Preview builds no longer touch
  production D1/R2. First Preview created 2026-10-03.
- Standing caveats: production `npm run deploy` still requires a remote-capable
  session for `deploy:database`; Stripe preview secrets and the preview
  `SITE_URL` variable are set outside the repo (Previews base config).
