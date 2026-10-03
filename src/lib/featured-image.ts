import type { Media } from '@/payload-types'

// Legacy R2 host for site-chrome assets that now live in `public/`.
const LEGACY_MEDIA_ORIGIN = 'https://media.eminent.sh/'

export function getFeaturedImageUrl(
  featuredImage: (number | null) | Media | null | undefined,
): string | null {
  if (!featuredImage || typeof featuredImage !== 'object') return null
  const url = featuredImage.url ?? null
  if (!url) return null
  // Rewrite existing absolute R2 URLs for migrated public assets to their
  // local public paths. R2-served `/api/media/file/...` URLs (including new
  // uploads, which still target R2) pass through unchanged.
  if (url.startsWith(LEGACY_MEDIA_ORIGIN)) return `/${url.slice(LEGACY_MEDIA_ORIGIN.length)}`
  return url
}
