import { getPayload } from 'payload'
import config from '@payload-config'

export type SitemapEntry = {
  url: string
  lastModified: Date
}

const STATIC_PATHS = [
  '/',
  '/blog',
  '/blog/categories',
  '/blog/tags',
  '/projects',
  '/projects/categories',
  '/projects/tags',
  '/contact',
  '/privacy',
  '/terms',
] as const

const publishedFilter = {
  and: [{ _status: { equals: 'published' as const } }, { slug: { exists: true } }],
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function entry(base: string, path: string, lastModified: Date): SitemapEntry {
  return {
    url: `${base}${path}`,
    lastModified,
  }
}

export async function getSitemapEntries(base: string): Promise<SitemapEntry[]> {
  const payload = await getPayload({ config })
  const now = new Date()

  const staticEntries: SitemapEntry[] = STATIC_PATHS.map((path) => entry(base, path, now))

  const [posts, projects, categories, tags] = await Promise.all([
    payload.find({
      collection: 'posts',
      limit: 0,
      where: publishedFilter,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'projects',
      limit: 0,
      where: publishedFilter,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'categories',
      limit: 0,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: 'tags',
      limit: 0,
      select: { slug: true, updatedAt: true },
    }),
  ])

  const dynamicEntries: SitemapEntry[] = [
    ...posts.docs
      .filter((doc) => doc.slug)
      .map((doc) => entry(base, `/blog/post/${doc.slug}`, new Date(doc.updatedAt))),
    ...projects.docs
      .filter((doc) => doc.slug)
      .map((doc) => entry(base, `/projects/project/${doc.slug}`, new Date(doc.updatedAt))),
    ...categories.docs
      .filter((doc) => doc.slug)
      .flatMap((doc) => [
        entry(base, `/blog/category/${doc.slug}`, new Date(doc.updatedAt)),
        entry(base, `/projects/category/${doc.slug}`, new Date(doc.updatedAt)),
      ]),
    ...tags.docs
      .filter((doc) => doc.slug)
      .flatMap((doc) => [
        entry(base, `/blog/tag/${doc.slug}`, new Date(doc.updatedAt)),
        entry(base, `/projects/tag/${doc.slug}`, new Date(doc.updatedAt)),
      ]),
  ]

  return [...staticEntries, ...dynamicEntries]
}

export function buildSitemapXml(
  entries: SitemapEntry[],
  stylesheetHref = '/sitemap.xsl',
): string {
  const urls = entries
    .map(
      ({ url, lastModified }) => `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${escapeXml(stylesheetHref)}"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}
