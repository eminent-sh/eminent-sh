import type { Media } from '@/payload-types'

export function getFeaturedImageUrl(
  featuredImage: (number | null) | Media | null | undefined,
): string | null {
  if (!featuredImage || typeof featuredImage !== 'object') return null
  return featuredImage.url ?? null
}
