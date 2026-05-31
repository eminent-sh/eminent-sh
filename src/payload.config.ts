import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { stripePlugin } from '@payloadcms/plugin-stripe'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { searchPlugin } from '@payloadcms/plugin-search'

import type { Config } from '@/payload-types'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Tags } from './collections/Tags'
import { Projects } from './collections/Projects'
import { Tenants } from './collections/Tenants'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) => realpath(value).endsWith(path.join('payload', 'bin.js')))
const isProduction = process.env.NODE_ENV === 'production'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as any // Use PayloadLogger type when it's exported

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Tenants, Media, Posts, Projects, Categories, Tags],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
    seoPlugin({
      collections: ['posts'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle: ({ doc }) =>
        doc?.title ? `${String(doc.title)} | EMINENT` : 'EMINENT',
      generateDescription: ({ doc }) =>
        (doc as { excerpt?: string })?.excerpt ?? undefined,
      generateURL: ({ doc, collectionSlug }) => {
        const base = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
        if (String(collectionSlug) === 'posts' && (doc as { slug?: string })?.slug) {
          return `${base}/blog/${(doc as { slug: string }).slug}`
        }
        return base
      },
      generateImage: ({ doc }) => {
        const img = (doc as { featuredImage?: number | { id: number } })?.featuredImage
        return img as string | number | { id: string | number } | undefined
      },
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: 'keywords',
          type: 'text',
          label: 'Meta Keywords',
          admin: { description: 'Comma-separated keywords for meta keywords.' },
        },
      ],
    }),
    formBuilderPlugin({
      redirectRelationships: ['posts', 'projects'],
    }),
    redirectsPlugin({
      collections: ['posts', 'projects'],
    }),
    mcpPlugin({
      collections: {
        posts: { enabled: true },
        projects: { enabled: true },
        categories: { enabled: { find: true } },
        tags: { enabled: { find: true } },
        media: { enabled: { find: true } },
      },
    }),
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      stripeWebhooksEndpointSecret: process.env.STRIPE_WEBHOOKS_ENDPOINT_SECRET,
    }),
    multiTenantPlugin<Config>({
      collections: {
        media: {},
        posts: {},
        projects: {},
        categories: {},
        tags: {},
      },
    }),
    searchPlugin({
      collections: ['posts', 'projects'],
      defaultPriorities: {
        posts: 20,
        projects: 10,
      },
      beforeSync: ({ originalDoc, searchDoc }) => ({
        ...searchDoc,
        title: searchDoc.title || (originalDoc as { title?: string })?.title,
      }),
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}
