import { cn } from '@/lib/utils'

export type HeroSize = 'compact' | 'tall'

/** Full-height splash: home, contact, indexes, project/post detail */
export const HERO_SIZE_SPLASH = 'tall' satisfies HeroSize

/** Short heading band: legal pages, category/tag filters, directory listings */
export const HERO_SIZE_COMPACT = 'compact' satisfies HeroSize

export const heroTitleClassName =
  'text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'

export function getHeroSectionClassName(size: HeroSize): string {
  return cn(
    'relative -mt-20 w-full bg-black pt-20 text-white',
    size === 'compact' ? 'min-h-0' : 'h-[calc(5rem+50vh)]',
  )
}

export function getHeroInnerClassName(size: HeroSize): string {
  return cn(
    'relative mx-auto w-full max-w-4xl px-6 sm:px-8',
    size === 'compact'
      ? 'flex flex-col items-center py-12 text-center sm:py-14'
      : 'flex h-[50vh] flex-col items-center text-center',
  )
}

export const heroDescriptionClassName =
  'mx-auto max-w-2xl text-lg text-white/85 sm:text-xl'

export const heroBannerClassName = 'w-full shrink-0 pt-2 sm:pt-4'

/** Centers the title + supplementary content as one block in the splash */
export const heroContentRegionClassName =
  'flex w-full min-h-0 flex-1 flex-col items-center justify-center'

export const heroContentClusterClassName = 'flex flex-col items-center gap-4'
