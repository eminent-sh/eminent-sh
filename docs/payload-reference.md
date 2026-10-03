# Payload implementation reference

Read the relevant sections before changing Payload schemas, access, hooks, endpoints,
adapters, admin components, or plugins. This preserves the detailed guidance previously
consolidated into the root agent instructions. Start with [AGENTS.md](../AGENTS.md) for
project orientation, commands, and approval boundaries; read
[agent context](agent-context.md) for source evidence and known implementation gaps.

Project-specific configuration takes precedence over generic recipes. The examples below
describe optional capabilities, not additional collections, fields, integrations, or
permissions already implemented by the application. In particular, the current project
has no tenant collection, tenant-membership schema, or application-wide roles.

## Contents

- [Security & Access Control](#security--access-control)
- [Payload Configuration, Collections & Globals](#payload-configuration-collections--globals)
- [Fields & Type Guards](#fields--type-guards)
- [Queries & APIs](#queries--apis)
- [Hooks & Request Context](#hooks--request-context)
- [Custom Endpoints](#custom-endpoints)
- [Database, Storage & Email Adapters](#database-storage--email-adapters)
- [Admin Components](#admin-components)
- [Plugin Development](#plugin-development)
- [Additional Resources](#additional-resources)

## Security & Access Control

### Non-Negotiable Rules

1. **Enforce Local API access explicitly.** Local API operations default to `overrideAccess: true`, even when a `user` is supplied. Always use `overrideAccess: false` when acting on behalf of a user, serving public requests, or testing permissions. Calling `req.payload` does not change this default.
2. **Preserve request context.** Pass `req` to every nested Local API operation in hooks, including reads, counts, writes, and cascading deletes. This preserves request identity, context, and any supported transaction. It does not itself provide transaction support on D1; see [Database, Storage & Email Adapters](#database-storage--email-adapters).
3. **Prevent hook recursion.** Check a request-context flag before a nested write that can invoke the same hook, and set that flag on the nested operation. Preserve other context values and return the document when skipping an `afterChange` hook. See [Hooks & Request Context](#hooks--request-context).
4. **Default deny and least privilege.** Validate client-provided IDs, data, ownership, and tenant membership on the server. Keep collection and field rules consistent. Expected lookup failures in permission checks should deny access, not grant it.
5. **Protect secrets.** Never commit `.env` files or credentials. Use Cloudflare Secrets in production and keep sensitive logic/configuration out of client bundles. Environment variables include `PAYLOAD_SECRET`, `SITE_URL`, `ANALYTICS_ID`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOKS_ENDPOINT_SECRET`.

### Local API Permission Boundary

```typescript
// User-scoped operation: supplying a user alone is not sufficient.
await payload.find({
  collection: 'posts',
  user: currentUser,
  overrideAccess: false,
})

// Anonymous access test: run without an authenticated request as well.
await payload.find({
  collection: 'posts',
  user: undefined,
  overrideAccess: false,
})
```

Only trusted server-side administrative jobs may deliberately bypass access with `overrideAccess: true`. Do not treat missing `user` as proof that a request is trusted. Authenticated endpoints and user-scoped webhooks must enforce the appropriate caller's permissions; independently authenticated system webhooks need an explicitly scoped authorization design.

### Access Layers

| Layer | Operations and return values |
|---|---|
| Collection | `read`, `update`, and `delete` can return a boolean or a query constraint for row-level filtering. `create` must authorize the incoming data with a boolean, not a document-query filter. |
| Collection admin | `admin` controls collection visibility in the Admin Panel; hiding UI does not replace API access rules. |
| Field | `create`, `read`, and `update` return booleans only, never query constraints. |
| Global | Single-document `read` and `update` authorization. |

Use Payload's `Access` and field-access types. Check for a missing user before constructing owner or membership filters; never build a permissive query around an undefined ID. Access functions may be async when an authoritative security check requires it.

Existing Posts and Projects allow authenticated reads and restrict anonymous reads to `{ _status: { equals: 'published' } }` when access control is enforced. Media, Categories, and Tags allow public reads. Multi-tenancy has been removed from the current configuration and dependencies. Existing frontend Local API reads omit `overrideAccess: false`; see the [implementation gaps](agent-context.md#implementation-gaps) before using them as permission examples.

```typescript
import type { Access } from 'payload'

export const anyone: Access = () => true
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

export const ownPostsOnly: Access = ({ req: { user } }) => {
  if (!user) return false
  return { author: { equals: user.id } }
}
```

### Roles, Ownership, Organizations, and Tenants

Payload does not supply a universal application-role system. `src/collections/Users.ts` currently defines no application-wide `roles` field or tenant membership; do not assume `admin`, `editor`, `moderator`, or `super-admin` roles exist. Use generated user types. Introducing roles or tenancy, or changing existing access, follows the review requirements in [Agent Behavior](../AGENTS.md#agent-behavior).

For an approved RBAC design:

- Define `roles` as a required, multi-select field with explicit options, a least-privileged default such as `['user']`, and `saveToJWT: true` when roles belong in the auth token. Restrict role creation and updates to prevent self-escalation; field-level reads can also restrict who sees roles.
- An `adminOnly` check returns an explicit boolean. An `adminOrSelf` check first rejects anonymous callers, then allows the authorized administrator or constrains `id` to `user.id`. Document-owner access uses the appropriate relationship, such as `author`.
- A sensitive field can allow the document's owner and administrators to read it while allowing only administrators to update it. Perform a real authenticated identity comparison, not `undefined === undefined`.
- Organization access can constrain a single `organization` with `equals` or `organizationId` with `in: user.organizationIds`. Team access can constrain a configured team field with membership IDs or query an existing `'team.members'` relationship. Missing memberships must not broaden access.
- For an approved future multi-tenant design, tenant access rejects unauthenticated users, scopes documents to validated tenant membership, and permits a super-admin bypass only if that role is actually defined. Validate tenant selection on create, populate it from trusted context when appropriate, and restrict later tenant reassignment. Design against the approved membership schema rather than a fictional `user.tenantId` field.
- Related-record checks can block deletion while dependents exist. `payload.count()` returns an object: inspect `totalDocs`, not the object itself. Pass the request and choose the access boundary deliberately; avoid access checks that recursively invoke themselves.

Reusable factory patterns keep these policies consistent:

| Factory pattern | Behavior |
|---|---|
| `createRoleBasedAccess(roles)` | Reject anonymous users, then test whether any required role appears in the user's actual roles. |
| `createOrgScopedAccess(allowAdmin = true)` | Filter by organization membership; allow an explicit admin bypass only when enabled. `false` keeps administrators scoped too. |
| `createTeamBasedAccess(teamField = 'teamId')` | Build a membership query using a configurable field name. |
| `createTimeLimitedAccess(daysAccess)` / `recentRecordsAccess(days)` | Apply a `createdAt` cutoff, with an optional, explicitly authorized administrator exception. |

Two optional policy templates, not changes to the existing collections:

- **Public content with authenticated editing:** administrators/editors create and update, public readers receive only published documents, and only administrators delete. Combine draft access with tenant restrictions.
- **Self-service profiles:** administrators create/delete accounts; users update only themselves; privileged fields remain separately protected. Expose public profile fields only if intentionally designed for public access, not the entire auth document.

### Context-Aware and Advanced Access

| Pattern | Implementation considerations |
|---|---|
| Locale-specific | Read `req.locale`; for example, allow authenticated users all configured locales and anonymous users only `en`. |
| Device-specific | Inspect `req.headers.get('user-agent')`; a `/mobile\|android\|iphone/i` match can distinguish presentation paths, but a spoofable user-agent is not a security boundary. |
| IP allowlist | Resolve a trustworthy client IP from the deployment's trusted proxy headers. Generic `x-forwarded-for` / `x-real-ip` recipes require proxy validation and forwarded-list parsing. Exact string membership handles literal IPs, not CIDR ranges such as `192.168.1.0/24`; CIDRs require real subnet matching. |
| Today's records | Require a user and constrain `createdAt` with `greater_than_equal` at the start of the day and `less_than` at the next day. Use an explicit timezone and calendar boundaries rather than assuming every day is 24 hours. |
| Last N days | Compute a cutoff and return `createdAt: { greater_than_equal: cutoff.toISOString() }`; define whether the window uses calendar days or elapsed time. |
| Scheduled content | Combine published status with `publishDate <= now` and either no `unpublishDate` or `unpublishDate > now`, using nested `and`/`or`. These are example fields; map them to the actual schema. Only authorized editors may bypass the window. |
| Active subscription | Require authentication, load the user's authorized subscription through `req.payload`, and allow only `status === 'active'`. Preserve `req`; missing subscriptions and lookup failures deny access. |
| Subscription tiers | A factory such as `tierBasedAccess(requiredTier)` can compare an ordered hierarchy like `free`, `basic`, `pro`, `enterprise`. Require an active subscription and reject unknown tiers before comparing indices; do not let `indexOf() === -1` accidentally grant access. |

### Access Performance, Testing, and Diagnostics

- Prefer indexed query constraints over loading every document and deciding in JavaScript. Avoid N+1 lookups and unnecessary sequential organization/team/subscription queries, without dropping security-critical checks for speed.
- Cache expensive permission results or promises in `req.context`, scoped to the relevant user, tenant, locale, and resource. Test for an absent cache entry explicitly so cached `false` results are reused. Never share request-specific permissions in a global cache.
- Field access may run for every item in a large array. Use simple booleans or a request-cached check rather than an async lookup for every item.
- Test anonymous, correct-user, wrong-user, administrator, cross-tenant, missing-membership, expired-subscription, and time-boundary cases. Local API tests must use the permission boundary above.
- Diagnose available access arguments (`req`, `user`, `id`, `data`) rather than assuming an ID is always supplied. Log safe identifiers, timestamps, and failed decisions through the logger; do not log secrets or replace real authorization with a debugging `return true`.
- Document the intent of complex rules, measure async-check costs, and audit access quarterly and after major changes.

## Payload Configuration, Collections & Globals

### Configuration and Organization

`src/payload.config.ts` is the source of truth: use `buildConfig` from `payload`, register collections explicitly, keep `admin.user` pointed at the Users collection, and retain the configured Lexical editor, secret, generated-type output, and plugin composition. The existing `admin.importMap.baseDir` resolves to `src/`; component paths are relative to that directory. Database and storage configuration belongs in [Database, Storage & Email Adapters](#database-storage--email-adapters), not a second minimal-config recipe.

Reusable collection/global definitions, hooks, and access functions can live in `src/collections/`, `src/globals/`, `src/hooks/`, and `src/access/` as needed. The latter three are organizational conventions, not evidence that those directories or features currently exist. Register any new definitions in the main config.

### Collection Configuration

Use `CollectionConfig` for a collection with a stable `slug`, `fields`, explicit access rules, and appropriate `timestamps`. Set `admin.useAsTitle` and `admin.defaultColumns` to actual field names. A typical content model combines a required title, generated slug, rich text, and author relationship; reuse the existing Posts/Projects schemas rather than creating competing examples. Review the intended tenant scope before adding uniqueness constraints or indexes.

- **Authentication:** `auth: true` supplies authentication fields such as email. Roles and ownership policies are covered once in [Security & Access Control](#security--access-control); enabling authentication does not create an application-wide role system.
- **Uploads:** an upload collection can configure `mimeTypes`, named `imageSizes` with dimensions/position, `adminThumbnail`, `focalPoint`, `crop`, and an alt-text field. For example, a `thumbnail` size may be 400 × 300 with `position: 'centre'`, while a `card` size may be 768 × 1024. These are optional presets, not the current Media schema. Verify image-processing support in the Workers runtime before enabling transforms. `staticDir` is a local-filesystem pattern, not a replacement for the project's R2 storage.
- **Globals:** use `GlobalConfig` for single-instance documents, with `slug`, optional `label`/`admin.group`, fields, and `read`/`update` access. A header/settings global might contain a media upload and a bounded navigation array (`maxRows`, link relationship, label). Point relationships only at registered collections. A global is not automatically tenant-specific; define that boundary before introducing one.

### Versions, Drafts, Localization, and Jobs

- `versions: { drafts: true }` enables draft/publish behavior and its `_status` field. Do not invent a parallel `status` field for publication state. Existing Posts use draft autosave.
- The expanded draft configuration can set `autosave`, `schedulePublish`, and `validate`; `versions.maxPerDoc` caps retained versions (for example, 100). Choose these options deliberately instead of copying defaults into every collection.
- `payload.create`/`payload.update` with `draft: true` writes draft content; draft validation settings can allow incomplete required fields. `find`/`findByID` with `draft: true` can retrieve the draft version. These options never replace authorization or tenant isolation.
- Scheduled publishing needs an operational jobs runner, not just `schedulePublish: true`. Payload jobs/tasks are also the optional mechanism for background work; define execution, retries, and access before adding them to a Workers deployment.
- Multilingual content requires top-level `localization` plus `localized: true` on the relevant fields. Only use configured locale values in queries and access checks. Content localization and Admin Panel interface translations are separate concerns.

## Fields & Type Guards

### Field Configuration Reference

| Field or capability | Configuration and behavior |
|---|---|
| Text / textarea | Use `required`, `unique`, `index`, `minLength`, `maxLength`, `defaultValue`, and `localized` where appropriate. `admin.placeholder`, `position: 'sidebar'`, and `condition` control presentation. |
| Slug generation | Use the installed API: `slugField({ useAsSlug: 'title' })` from `payload`, as in Posts. Do not copy the obsolete `fieldToUse` option. |
| Rich text | Use `lexicalEditor()` and its `features` callback. Preserve desired `defaultFeatures`; configure `HeadingFeature({ enabledHeadingSizes: [...] })` and `LinkFeature({ enabledCollections: [...] })` against registered collections. Avoid accidentally duplicating features already in the default set. |
| Relationship | Set `relationTo`, optional `hasMany`, `required`, and `maxDepth`. A string targets one collection; an array allows polymorphic relationships. `filterOptions` constrains eligible related documents and must use real fields, not a fictional `active` property. |
| Polymorphic values | Handle `{ relationTo, value }`, where `value` may be an ID or populated document. Ordinary relationships likewise return IDs or documents depending on depth; use generated types and narrow before accessing properties. |
| Upload | Set `relationTo` to an upload-enabled collection such as `media`; optional `required` and `filterOptions` can restrict selection (for example, image MIME types). Validate file and relationship permissions server-side as well. |
| Array | Define child `fields`, `minRows`/`maxRows`, singular/plural `labels`, and optional `admin.initCollapsed`. Rows are repeated structured data. |
| Blocks | Define reusable `Block` configurations with `slug`, optional `interfaceName`, and `fields`; supply them to a `type: 'blocks'` field. Different block types can compose a layout, such as hero and rich-text content blocks. |
| Select | Options may be strings or `{ label, value }` objects. Use `defaultValue`, `required`, and `hasMany` deliberately; distinguish a single value from an array. Prefer typed constants for reusable options. Existing tags are relationships, not a reason to replace them with a fixed select. |
| Tabs and groups | Unnamed tabs/groups organize UI without an extra named object; named containers affect the document shape. A named `group`, such as `meta`, nests its child fields. Rows and collapsibles also require traversal even though they are layout containers. |
| Join | A `type: 'join'` field defines a reverse relationship using `collection` and `on`, where `on` names the other collection's referencing field. Do not assume joins have the same response shape or pagination as a normal relationship. |
| Virtual | `virtual: true` with an `afterRead` hook can compute data from `siblingData`, such as a full name. Virtual relationship paths are another form. Do not persist virtual values during database transforms. |
| UI | `type: 'ui'` adds a presentational component without storing a data field. See [Admin Components](#admin-components). |
| Point / geospatial | Generic `point`, `near`, and `within` recipes are adapter-dependent and must not be assumed supported by D1/SQLite. Coordinates use longitude before latitude, with distance limits in meters where supported. Verify the exact adapter before implementing geospatial behavior; do not copy a generic distance query into this project. |

`admin.condition` can show an upload only when a sibling flag is enabled; it is not a security boundary or a substitute for validation. Similarly, hidden/read-only admin controls do not authorize API requests. Relationship filters must be combined with the existing access constraints, including tenant constraints if tenancy is introduced through an approved design.

Custom `validate` functions return `true` or an actionable error string. Use the supplied `operation`, `data`, and `siblingData` for operation-specific or cross-field validation. Narrow optional values before string operations, validate required inputs on the server, and preserve useful built-in validation rather than replacing it with a weaker check.

### Runtime Type Guards

Import field types and these utilities from `payload`; narrow before reading type-specific properties. A data-bearing name alone does not mean a field is persisted, visible, or accessible.

| Guard | Purpose |
|---|---|
| `fieldAffectsData` | Identify named, non-UI data-bearing fields before accessing `name`. Check virtual fields separately for persistence. |
| `fieldHasSubFields` | Access nested `fields` on arrays, groups, rows, and collapsibles. This alone does not traverse tabs or blocks. |
| `fieldIsArrayType` | Narrow to arrays and their row limits. |
| `fieldIsBlockType` | Narrow to blocks and their block definitions. |
| `fieldIsGroupType` | Narrow to groups and group-specific options such as `interfaceName`. |
| `fieldSupportsMany` | Check support for `hasMany` on selects, relationships, and uploads; then inspect its value. |
| `fieldHasMaxDepth` | Check relationship/upload/join depth configuration before accessing a numeric `maxDepth`. |
| `fieldIsPresentationalOnly` | Identify UI-only fields to exclude from data/schema work. |
| `fieldIsSidebar` | Detect sidebar positioning. |
| `fieldIsID` | Detect the special `id` field. |
| `fieldIsHiddenOrDisabled` | Filter fields for appropriate UI operations; this is not an access-control check. |
| `fieldShouldBeLocalized({ field, parentIsLocalized })` | Account for inherited localization when deciding whether a separate localized representation is needed. |
| `fieldIsVirtual` | Detect computed/virtual fields. If inspecting a virtual path, also narrow the property to a string; this helper is not a substitute for property narrowing. |
| `tabHasName` / `groupHasName` | Distinguish named, data-nesting containers from unnamed layout containers. |
| `optionIsObject` / `optionsAreObjects` / `optionIsValue` | Safely handle individual object options, all-object arrays, or string options. |
| `valueIsValueWithRelation` | Identify polymorphic relationship values before reading their collection and value. |

A recursive visitor must descend through layout containers even when the container itself does not affect data:

```typescript
import type { Field } from 'payload'
import { fieldAffectsData, fieldHasSubFields, fieldIsBlockType } from 'payload'

function visitDataFields(fields: Field[], visit: (field: Field) => void): void {
  for (const field of fields) {
    if (fieldAffectsData(field)) visit(field)
    if (fieldHasSubFields(field)) visitDataFields(field.fields, visit)

    if (field.type === 'tabs') {
      for (const tab of field.tabs) visitDataFields(tab.fields, visit)
    }

    if (fieldIsBlockType(field)) {
      for (const block of field.blocks ?? []) visitDataFields(block.fields, visit)
    }
  }
}
```

This visitor handles inline block definitions. If using shared block references, resolve them from the registered block configuration as well, with a visited set to prevent cycles. Handle arrays and blocks before a generic container branch when behavior differs. For UI-only filtering, combine data-bearing/presentational/hidden guards as needed; do not use that filtered list as an authorization or database schema definition.

## Queries & APIs

### Payload Instance and Local API

Obtain Payload on the server using `getPayload({ config })` with `config` from `@payload-config`. Next.js route handlers can return `Response.json`; Server Components can render the returned documents directly. Do not move the Payload config or Local API into a Client Component.

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    depth: 0,
    limit: 10,
    page: 1,
    sort: '-createdAt',
    select: { title: true, slug: true },
  })

  return Response.json(posts)
}
```

This example is deliberately anonymous and relies on collection access rules. Authenticated operations must carry the verified caller, and nested operations must preserve the request, as specified in [Security & Access Control](#security--access-control).

| Local API method | Main arguments / result |
|---|---|
| `find` | `collection`, optional `where`, `depth`, `limit`, `page`, `sort`, `locale`, `select`, and draft options; returns `docs` and pagination metadata including `totalDocs` and `hasNextPage`. |
| `findByID` | `collection`, validated `id`, optional depth/selection/draft options; returns a single document. |
| `create` | `collection` and validated `data`; include the actual required fields and use `_status`/draft options for versioned content. |
| `update` | `collection`, `id` (or a deliberately scoped `where`), and a minimal `data` patch. Publishing uses `_status: 'published'`, not a made-up `status` field. |
| `delete` | `collection` plus `id` or an explicitly scoped bulk `where`; account for dependents and hooks. |
| `count` | `collection` and optional `where`; returns `{ totalDocs }`. Use it instead of retrieving documents just to count them. |
| `findGlobal` / `updateGlobal` | Address a registered global by `slug`; updates supply validated `data`. The same caller/access boundary applies. |

Use generated ID types rather than assuming string IDs; this project's D1 documents use numeric IDs. Bound pagination and exhaust all pages when an operation genuinely needs every match. Prefer `depth: 0` for IDs-only relationships, cap field `maxDepth`, use `select` for required fields only, and index frequent filters. Request-scoped caches must include all relevant identity, tenant, and locale inputs.

### Query Operators and Composition

Use Payload's `Where` type when building reusable queries. Multiple field constraints combine as AND; `and`/`or` arrays express explicit nested logic. Dotted paths address nested fields and supported relationship properties, for example `'author.email'` or `'meta.title'`, but must match the actual schema.

| Operator | Example / intent |
|---|---|
| `equals` / `not_equals` | `{ _status: { equals: 'published' } }` or excluding the current document by `id`. |
| `greater_than`, `greater_than_equal`, `less_than`, `less_than_equal` | Numeric or date ranges, with deliberate inclusive/exclusive boundaries. |
| `contains` | Substring matching, for example `{ title: { contains: 'payload' } }`. Test case behavior against D1 rather than assuming every backend treats text identically. |
| `like` | Match all supplied words, for example `{ excerpt: { like: 'cms headless' } }`. |
| `in` / `not_in` | Match/exclude an allowed list of scalar values or relationship IDs. |
| `exists` | Check whether a value exists, for example `{ featuredImage: { exists: true } }`. |

```typescript
import type { Where } from 'payload'

const where: Where = {
  and: [
    { _status: { equals: 'published' } },
    {
      or: [
        { title: { contains: 'payload' } },
        { excerpt: { contains: 'payload' } },
      ],
    },
  ],
}
```

Geospatial operators are subject to the adapter restriction in [Fields & Type Guards](#fields--type-guards). Computed virtual fields can avoid storing redundant values, but do not assume every virtual value is queryable in the database.

### REST and GraphQL

Default REST route shapes (respect any configured API base path):

| Method | Route | Operation |
|---|---|---|
| GET | `/api/{collection}` | Find documents. |
| GET | `/api/{collection}/{id}` | Find by ID. |
| POST | `/api/{collection}` | Create. |
| PATCH | `/api/{collection}/{id}` | Update. |
| DELETE | `/api/{collection}/{id}` | Delete. |
| GET | `/api/{collection}/count` | Count. |
| GET | `/api/globals/{slug}` | Read a global. |
| POST | `/api/globals/{slug}` | Update a global. |

Serialize REST filters as nested `where` query parameters, along with `depth`, `limit`, and other options. `stringify({ where, depth: 0, limit: 10 }, { addQueryPrefix: true })` from `qs-esm` is a common nested-query pattern; use an available compatible serializer rather than adding a dependency just for an example. Append the result to the endpoint, check `response.ok`, and then parse `response.json()`. Authentication and tenant selection must be carried through the actual HTTP request.

When GraphQL is enabled, use its generated schema for names, input types, relationships, and enum values. Queries such as `Posts` accept filters, limits, and sorting and can return selected fields and pagination; mutations such as `createPost` take the actual collection input shape. For example:

```graphql
query PublishedPosts {
  Posts(where: { _status: { equals: published } }, limit: 10, sort: "-createdAt") {
    docs {
      id
      title
      author {
        email
      }
    }
    totalDocs
    hasNextPage
  }
}
```

Select only needed fields and check GraphQL errors as well as HTTP status. REST and GraphQL are alternatives to the Local API, not alternative permission policies.

## Hooks & Request Context

### Lifecycle and Return Values

| Hook | Appropriate use |
|---|---|
| Collection `beforeValidate` | Normalize incoming data or derive slugs before validation; distinguish create from update and return `data`. |
| Collection `beforeChange` | Enforce business rules immediately before persistence; use `operation` and `originalDoc`, then return `data`. |
| Collection `afterChange` | Perform post-save work using `doc`, `previousDoc`, `operation`, `req`, and `context`; return `doc`, including skip branches. |
| Collection `afterRead` | Enrich returned documents or compute non-persisted values; return `doc` and avoid N+1 lookups. |
| Collection `beforeDelete` | Validate dependent records or perform explicitly authorized cascading deletes using the incoming `id` and request. |
| Field hooks | Operate on and return `value`, not the whole document; use `siblingData`, `data`, and request information as needed. |

Import the corresponding `CollectionBeforeChangeHook`, `CollectionAfterChangeHook`, or `FieldHook` types from `payload`, and use generated document types for typed collection hooks. Normalize strings only after checking their type. A field `afterRead` hook may format or mask an email, but masking is not a substitute for field access and must not rely on nonexistent roles.

For a first-publication date, a date field's `beforeChange` hook can return an ISO timestamp when `siblingData._status === 'published'` and no value exists; otherwise return the supplied value. At collection level, also consider `originalDoc` because updates can be partial. Do not reset the original publication date on every save. Prefer `beforeValidate`/`beforeChange` for changes to the document currently being saved rather than issuing a second write from `afterChange`.

### Nested Operations and Recursion

For an unavoidable nested write, the essential shape inside a hook is:

```typescript
if (context.skipPostSync) return doc

await req.payload.update({
  collection: 'posts',
  id: doc.id,
  data: changes, // A validated, minimal patch; do not resubmit the entire document.
  req,
  overrideAccess: false,
  context: { ...req.context, ...context, skipPostSync: true },
})

return doc
```

This is a hook-body pattern, not a standalone hook or an instruction to add a self-update. Use a specific flag for the side effect being suppressed, such as `skipNotification` or `skipPostSync`, and check it before the operation that re-enters the hook. Preserve unrelated flags and request state. For child resaves or cascades, carry `req` on the initial find/count and every update/delete, scope the relationship and tenant correctly, and process all required pages.

`req.context`/hook `context` can share expensive data or promises between lifecycle stages. Reuse cached `false` values and avoid cross-request caching of permissions. Side effects such as notifications, external calls, and jobs should be idempotent; neither passing `req` nor a database rollback undoes an external message. Multi-operation atomicity is adapter-dependent as explained below.

### Next.js Revalidation

Use `revalidatePath` from `next/cache` in the appropriate Next.js runtime. Respect a `disableRevalidate` context flag. In an `afterChange` hook:

- Revalidate the current public path when the saved document is published.
- If a previously published document is unpublished **or its slug changes**, also invalidate the old path derived from `previousDoc`.
- Handle deletion and relevant listing/homepage/cache-tag invalidation as needed, not just detail pages.
- Use real route shapes (`/blog/post/${doc.slug}` for posts and `/projects/project/${doc.slug}` for projects); a generic home-page special case maps to `/` only if that model actually exists.
- Log useful paths through `req.payload.logger` without exposing private content, and return `doc` even when revalidation is skipped.

## Custom Endpoints

Custom endpoints use Payload's `Endpoint` type (`path`, HTTP `method`, and a `handler` returning a Web API `Response`). They do not automatically enforce a collection's permissions. A protected endpoint must reject a missing `req.user`; a public endpoint must deliberately limit what it exposes. Independently authenticated webhooks require verified signatures and a scoped system authorization design.

```typescript
import type { Endpoint } from 'payload'
import { APIError } from 'payload'

export const myPostsEndpoint: Endpoint = {
  path: '/my-posts',
  method: 'get',
  handler: async (req) => {
    if (!req.user) throw new APIError('Unauthorized', 401)

    const posts = await req.payload.find({
      collection: 'posts',
      where: { author: { equals: req.user.id } },
      limit: 10,
      depth: 0,
      req,
      overrideAccess: false,
    })

    return Response.json(posts)
  },
}
```

### Input, Responses, and Placement

- **Route parameters:** use `req.routeParams`, for example `id` in `/:id/tracking`. Validate the parameter and its ID type before querying, authorize the target record, and return a deliberate not-found response when appropriate.
- **JSON:** parse with the request's JSON parser, treat the result as untrusted input, and validate/allowlist fields before passing `data` to create/update. Handle malformed JSON and missing values rather than forwarding arbitrary request bodies.
- **Uploads:** `await addDataAndFileToRequest(req)` from `payload` handles JSON/multipart data and files, populating `req.data` and `req.file`. Validate both before passing them as `data` and `file` to the appropriate Local API operation.
- **Query parameters:** use `new URL(req.url).searchParams`. Validate search text; parse limits with an explicit radix, reject non-finite/invalid numbers, and enforce reasonable bounds. Never allow a supplied limit or query to bypass access/tenant constraints.
- **Errors:** throw `APIError` for consistent errors, such as `new APIError('Email is required', 400)`. Use suitable 400/401/403/404 statuses and `Response.json(body, { status })`; log diagnostic details with `req.payload.logger` without exposing secrets to the response.
- **CORS:** where needed, pass `headersWithCors({ headers: new Headers(), req })` from `payload` as the response's `headers`. CORS is not authentication or CSRF protection.

| Endpoint registration | Default route |
|---|---|
| Collection `endpoints` | `/api/{collection-slug}/{path}` |
| Global `endpoints` | `/api/globals/{global-slug}/{path}` |
| Root config `endpoints` | `/api/{path}` |

Use the configured API prefix if it differs from `/api`. Destructive or state-changing actions, such as clearing caches or issuing refunds, need appropriately protected mutation endpoints rather than an unrestricted GET handler. Calling `req.payload` runs normal operations/hooks but still requires the explicit access boundary shown above.

## Database, Storage & Email Adapters

### Cloudflare D1 and Request/Transaction Semantics

The project uses `sqliteD1Adapter` from `@payloadcms/db-d1-sqlite` with `binding: cloudflare.env.D1`. Preserve the existing Cloudflare-context bootstrap: development/CLI uses the Wrangler platform proxy, and production Workers use OpenNext's Cloudflare context. Do not replace this with a generic database URL, a local `file:./payload.db`, or another database adapter's configuration.

The current config does not enable `transactionOptions`. Passing `req` preserves context but does **not** make a sequence of D1 Local API calls atomic. Do not blindly copy the standalone SQLite recipe `transactionOptions: {}` or promise rollback across hooks. Verify transaction support in the exact D1 adapter/runtime before introducing a transactional design, and account for partial failure with idempotency or compensating operations when necessary.

For an adapter/runtime that actually supports manual transactions, the lifecycle is `payload.db.beginTransaction()`, nested operations carrying the returned `transactionID` on the preserved request, then `commitTransaction(transactionID)` on success or `rollbackTransaction(transactionID)` on failure followed by rethrowing the error. Confirm that a usable transaction was started; do not replace the caller's request with only `{ transactionID }`. This is an API reference, not a supported transaction guarantee for this deployment. Database transactions also do not roll back R2 uploads, email, or external API effects.

Use versioned migrations in `src/migrations/` when persistent schema changes require them. Do not confuse development schema synchronization with applying reviewed migrations to production. The generation, review, and production-operation restrictions in [Agent Behavior](../AGENTS.md#agent-behavior) apply. Before changing persistence, read the [migration history and runtime boundary](agent-context.md#deployment-and-persistence) for the tenant foreign-key repairs and production CLI binding behavior.

### Storage

Current media storage is `r2Storage` from `@payloadcms/storage-r2`, configured with `bucket: cloudflare.env.R2` and `collections: { media: true }` in the plugin list. Keep the binding and collection mapping intact. Adding a different storage adapter is an architectural change, not part of a generic collection recipe.

Other Payload storage packages in the reference patterns are optional alternatives, **not installed/configured integrations**:

| Package | Backend / configuration considerations |
|---|---|
| `@payloadcms/storage-s3` | AWS S3; `s3Storage` takes a collection map, bucket, and S3 client config including region and server-side credentials. |
| `@payloadcms/storage-azure` | Azure Blob Storage. |
| `@payloadcms/storage-gcs` | Google Cloud Storage. |
| `@payloadcms/storage-vercel-blob` | Vercel Blob. |
| `@payloadcms/storage-uploadthing` | Uploadthing. |

An S3 setup typically uses server-side bucket/region settings and `accessKeyId`/`secretAccessKey`; these are not substitutes for the existing R2 binding. Keep all credentials out of source and client bundles, and verify Workers compatibility before changing providers.

### Email

No email adapter is explicitly configured in the current Payload config. Optional recipes:

- **SMTP:** `nodemailerAdapter` from `@payloadcms/email-nodemailer`, with `defaultFromAddress`, `defaultFromName`, and `transportOptions` containing SMTP host, port (commonly 587), and authentication user/password. Check the Workers runtime's transport compatibility before adopting a Node-oriented SMTP recipe.
- **Resend:** `resendAdapter` from `@payloadcms/email-resend`, with `defaultFromAddress`, `defaultFromName`, and a server-side `apiKey` such as `process.env.RESEND_API_KEY`.

Register an approved email adapter through the top-level `email` config, verify sender/delivery configuration, and supply credentials through the environment. Do not silently install dependencies or assume an example provider is already available.

## Admin Components

### Registration and Component Boundaries

Custom components fall into four scopes: root Admin Panel UI, collection views, global document views, and field editors/list cells. Register components by path rather than importing React implementations into the Payload config.

- Paths are relative to `admin.importMap.baseDir` (currently `src/`), so `/components/Logo` resolves under `src/components/`, not `/src/components/` beneath that base.
- Default exports need no suffix; named exports use `/components/Logout#Logout` or an object with `path: '/components/Logout'` and `exportName: 'Logout'`. File extensions may be omitted.
- Component objects can add `clientProps` and `serverProps`. Client props must be serializable; keep ordinary callback functions, instances, secrets, and the Payload instance on the server. Define client event handlers inside the Client Component rather than passing functions through config `clientProps`.
- Prefer Server Components where the slot supports them for async reads and server-only logic. Use `'use client'` at the top of a file when state, effects, event handlers, browser APIs, or admin React hooks are needed.
- Props vary by slot: server components may receive `payload`, `req`, `i18n`, `locale`, and document/field information. Use the exported component types rather than assuming every slot receives every prop. Server-side Local API reads still follow the caller/access rules in [Security & Access Control](#security--access-control).
- Server code can access full configuration through `payload.config`; client code uses the sanitized config from `useConfig()`. Non-serializable configuration such as validation functions is not client configuration, and sanitization is not a reason to pass arbitrary sensitive custom props.

### Root, Collection, and Global Slots

Root slots live under `admin.components`:

| Slot | Purpose |
|---|---|
| `Nav` | Replace the navigation sidebar. |
| `graphics.Icon` / `graphics.Logo` | Branding icon and full logo, including login branding. |
| `logout.Button` | Replace the logout control. |
| `actions` / `header` | Arrays of header actions or content above the header. |
| `beforeDashboard` / `afterDashboard` | Arrays surrounding dashboard content. |
| `beforeLogin` / `afterLogin` | Arrays surrounding the login form. |
| `beforeNavLinks` / `afterNavLinks` | Arrays surrounding navigation links. |
| `settingsMenu` | Custom settings-menu items. |
| `providers` | Additional React context providers. |
| `views` | Custom views or replacements such as a dashboard `Component`. |

Collection/global edit slots under `admin.components.edit` include `PreviewButton`, `SaveButton`, `SaveDraftButton`, and `PublishButton` where supported. `SaveButton` is for non-draft collections; `PublishButton` requires drafts; `SaveDraftButton` requires drafts with autosave disabled. Do not present all buttons as simultaneously applicable to the existing autosave setup.

For collection lists, `beforeList`, `afterList`, `beforeListTable`, and `afterListTable` are directly under `admin.components` in this Payload version, not under a made-up `components.list` object. Use the supported view configuration when replacing a whole list view/header. Preserve existing component arrays when adding controls, filters, or list footers. Global components customize a single global document's edit view rather than a collection list.

### Field Editors, Cells, and UI Fields

- A field's `admin.components.Field` replaces its edit UI; `admin.components.Cell` customizes its list cell. `type: 'ui'` is for presentational controls that should not add persisted data.
- Use `TextFieldServerComponent`, `TextFieldClientComponent`, `SelectFieldClientComponent`, and the appropriate exported cell/field types from `payload`. Consult the installed declaration for a given slot rather than inventing type names.
- Server field components receive full `field` configuration and a sanitized `clientField`. In this version, a Client field component receives its sanitized configuration as **`field`**, not `clientField`.
- Bind edits through `useField({ path })` and its `value`/`setValue`; honor read-only state and provide labels, validation feedback, and accessible controls. A plain uncontrolled input is not a Payload form integration.
- Select options can be strings or objects, and labels may be translated. Narrow with the option guards, render the correct `value`/label, and support `hasMany` when the field allows it.
- Cells can use `cellData` for the current value and the slot's row/document props for context, for example rendering publication status with an accessible label rather than relying on color alone.
- UI actions can get the current document ID with `useDocumentInfo()` and call a protected endpoint. Check that an ID exists, handle pending/error/success states, and inspect the HTTP response before announcing a result. Refund and cache-clear buttons are optional examples, not currently implemented endpoints.

### Client Hooks and Data Loading

Import supported hooks from `@payloadcms/ui`; they require the appropriate Admin Panel providers and Client Component context.

| Hook | Use |
|---|---|
| `useAuth` | Current authenticated user. |
| `useConfig` | Client-safe Payload configuration. |
| `useDocumentInfo` | Current document ID, collection, and related editing information. |
| `useField` | A field's controlled value and setter. |
| `useForm` | Form operations/state. |
| `useFormFields` | Selector-based subscriptions to specific field state. |
| `useLocale` | Current content locale. |
| `useTranslation` | Interface translations, `t`, and `i18n`. |
| `usePayloadAPI` | HTTP API data loading; it is not the server Local API. |

Do not use the old example's nonexistent `usePayload()`/`getLocal` client Local API. Use `usePayloadAPI` or `fetch` against authorized endpoints. Effects that fetch data should handle loading, errors, response status, and cancellation/stale responses rather than blindly parsing and setting state.

For conditional UI, `useFormFields(([fields]) => fields.enableFeature?.value)` subscribes to a specific sibling flag; use the real field path, including array/group nesting. For a custom input, separately bind `useField({ path })`. Keep hooks unconditional before any early render return. Server-side related-content components can query the source document at `depth: 0`, filter by its actual category relationship, exclude its ID with `not_equals`, and limit results, all with the same request/access boundary.

### Translations, Styling, and Performance

- Server-side translated labels use `getTranslation` from `@payloadcms/translations` with the provided `i18n`. Client components use `useTranslation()`, for example `t('namespace:key', { variable: 'value' })`, and can inspect `i18n.language`. Do not render a localized label object directly as a React child.
- Import component styles normally. Use Payload theme tokens such as `--theme-elevation-500`, `--theme-elevation-900`, `--theme-text`, `--base`, and `--border-radius-m` rather than hardcoding a light-only palette. SCSS helpers such as `mid-break` come from `@payloadcms/ui/scss`; use the Sass resolution syntax supported by the toolchain rather than assuming a legacy `~` prefix.
- In the Admin Panel, use exports from `@payloadcms/ui`. For frontend code, prefer the project's UI primitives or a supported specific entry point such as `@payloadcms/ui/elements/Button` rather than pulling admin dependencies into the public bundle.
- Prefer `useFormFields` selectors over subscribing a component to every form change. Use stable list keys and, where measurement warrants it, `React.memo` and stable callbacks; avoid needless re-renders of expensive children.
- Keep data loading on the server when possible, minimize serialized client props, and use appropriate Suspense boundaries. For counts, use the Local API `count` operation rather than retrieving an unbounded list.

### Import Maps and Troubleshooting

Payload resolves registered paths through the generated import map, normally `src/app/(payload)/admin/importMap.js` here. The configured `admin.importMap.baseDir` controls path resolution; `admin.importMap.importMapFile` can override the destination when deliberately required. Use the project's `npm run generate:importmap` script after admin component changes as specified in [Agent Behavior](../AGENTS.md#agent-behavior); do not hand-maintain component mappings.

If a component does not load, check its path relative to the base directory, default versus named export, generated map, and TypeScript errors. For missing-hook/provider errors such as `useConfig` failures, verify client/server boundaries and provider context, then check for mismatched or duplicate Payload packages. Keep `payload` and compatible `@payloadcms/*` packages aligned to the same release rather than copying an old `3.0.0` version example; inspect both the manifest and resolved lockfile before changing dependencies.

## Plugin Development

### Configuration Transforms and Composition

A plugin factory accepts options and returns a Payload `Plugin`, which transforms `Config`. Use types from `payload` for `Config`, `Plugin`, `CollectionConfig`, `Field`, hooks, and endpoints; use generated types for documents. For example, this optional factory extends selected collections with caller-supplied fields while preserving other configuration:

```typescript
import type { Config, Field, Plugin } from 'payload'

type FieldExtensionOptions = {
  collections: string[]
  fields: Field[]
}

export const extendCollectionFields =
  (options: FieldExtensionOptions): Plugin =>
  (config: Config): Config => ({
    ...config,
    collections: (config.collections ?? []).map((collection) =>
      options.collections.includes(collection.slug)
        ? { ...collection, fields: [...collection.fields, ...options.fields] }
        : collection,
    ),
  })
```

Validate field-name collisions and target collection slugs before applying a transform. Do not add a second SEO or redirects implementation when the configured plugins already provide that feature.

| Extension | Composition pattern |
|---|---|
| Add fields | Map only selected collections; retain existing fields and nested configuration. A callback such as `fields: ({ defaultFields }) => [...]` allows users to extend or replace defaults deliberately. |
| Add collections | Append to `config.collections ?? []`; do not replace the existing list. Define appropriate access for every operation, not just public read. |
| Collection overrides | Apply documented `Partial<CollectionConfig>` overrides after defaults. Explain which arrays/objects replace defaults, and merge access/hooks/fields deliberately so a shallow spread does not accidentally discard safeguards. |
| Hooks | Preserve `collection.hooks`, compose hook arrays, and document order. For example, `afterChange: [myHook, ...(collection.hooks?.afterChange ?? [])]` runs the plugin hook first. |
| Root endpoints | Append to `config.endpoints ?? []`, use a plugin-specific path such as `/plugin-name/action`, and follow [Custom Endpoints](#custom-endpoints) for validation, authentication, and responses. |
| Admin components | Preserve `config.admin`, `components`, and existing slot arrays. Package paths can expose separate client/RSC entry points, such as `my-plugin/client#BeforeDashboardClient` and `my-plugin/rsc#BeforeDashboardServer`. |

Nested child-resave hooks must follow [Hooks & Request Context](#hooks--request-context), including request propagation, scoped authorization, recursion guards, pagination, and minimal patches. The fact that a hook or endpoint came from a plugin does not exempt it from those requirements.

### Enable/Disable Behavior and Initialization

- Choose a clear `enabled`/`disabled` option and document what it controls. Disabling runtime behavior should generally retain the plugin's collections/fields for schema consistency while omitting optional endpoints, side-effect hooks, and UI components. Do not inadvertently remove tenant/access safeguards or drop persisted schema when toggling a feature flag.
- Preserve existing `config.onInit`: capture it and `await incomingOnInit(payload)` before performing the plugin's own initialization. Do not overwrite another plugin's initializer.
- Initialization/seed work should be explicit and idempotent. Query/count by a real unique key, inspect `totalDocs`, and create only missing records with complete required data. Handle concurrent initialization; a count-then-create check alone is not race-safe. Do not copy a string seed ID into this project's numeric-ID schema.
- Trusted initialization can deliberately use `overrideAccess: true` only within its reviewed administrative scope. User-triggered plugin operations still use the standard caller boundary. Do not perform unintended production writes merely because the config or CLI initializes.
- Prefer non-mutating transforms and preserve configuration arrays/objects. Initialize absent containers where necessary, honor documented user overrides without silently weakening security, and test composition with the existing plugins.
- Adding a plugin, changing persistent fields, or introducing admin components invokes the existing review, migration, generated-types, and import-map requirements; the examples above do not add any of those features to this application.

## Additional Resources

- **Payload CMS docs**: https://payloadcms.com/docs
- **Payload LLM context**: https://payloadcms.com/llms-full.txt
- **Payload GitHub**: https://github.com/payloadcms/payload
- **Examples**: https://github.com/payloadcms/payload/tree/main/examples
- **Templates**: https://github.com/payloadcms/payload/tree/main/templates
- **Custom components**: https://payloadcms.com/docs/custom-components/overview
- **Root components**: https://payloadcms.com/docs/custom-components/root-components
- **Custom views**: https://payloadcms.com/docs/custom-components/custom-views
- **Admin React hooks**: https://payloadcms.com/docs/admin/react-hooks
- **Custom CSS**: https://payloadcms.com/docs/admin/customizing-css
