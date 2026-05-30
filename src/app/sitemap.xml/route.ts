import { getServerSideURL } from '@/utilities/getURL'
import { buildSitemapXml, getSitemapEntries } from '@/lib/sitemap'

export const revalidate = 86400

export async function GET() {
  const base = getServerSideURL()
  const entries = await getSitemapEntries(base)
  const xml = buildSitemapXml(entries)

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
