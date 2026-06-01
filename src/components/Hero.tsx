import React from 'react'
import { cn } from '@/lib/utils'
import {
  type HeroSize,
  getHeroInnerClassName,
  getHeroSectionClassName,
  heroBannerClassName,
  heroContentClusterClassName,
  heroContentRegionClassName,
  heroDescriptionClassName,
  heroTitleClassName,
} from '@/components/hero-layout'

function HeroBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute -right-[20%] -top-[10%] h-[80%] w-[70%] opacity-[0.15]"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 70% 20%, oklch(0.35 0.02 260), transparent 60%), radial-gradient(ellipse 100% 80% at 90% 40%, oklch(0.25 0.01 260), transparent 55%)',
        }}
      />
      <div
        className="absolute -left-[15%] -top-[5%] h-[60%] w-[50%] opacity-[0.12]"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 20% 10%, oklch(0.3 0.02 280), transparent 55%)',
        }}
      />
      <div
        className="absolute right-0 top-1/3 h-2/3 w-1/2 opacity-[0.08]"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 80% 50%, oklch(0.4 0.015 250), transparent 65%)',
        }}
      />
    </div>
  )
}

const HERO_IMAGES = {
  home: 'https://media.eminent.sh/home-hero.jpg',
  contact: 'https://media.eminent.sh/contact-hero.jpg',
  blog: 'https://media.eminent.sh/blog-hero.jpg',
  projects: 'https://media.eminent.sh/projects-hero.jpg',
} as const

function HeroTitle({
  title,
  titleClassName,
}: {
  title: React.ReactNode
  titleClassName?: string
}) {
  const className = cn(heroTitleClassName, titleClassName)

  if (typeof title === 'string') {
    return <h1 className={className}>{title}</h1>
  }

  return <div className={className}>{title}</div>
}

export interface HeroProps {
  /** Defaults to compact; use `HERO_SIZE_SPLASH` for full splashes (see hero-layout.ts) */
  size?: HeroSize
  title?: React.ReactNode
  titleClassName?: string
  description?: string
  /** Optional content above the title band (e.g. home consultation link) */
  banner?: React.ReactNode
  children?: React.ReactNode
  backgroundImage?: string
  imageKey?: keyof typeof HERO_IMAGES
}

export function Hero({
  size = 'compact',
  title,
  titleClassName,
  description,
  banner,
  children,
  backgroundImage: backgroundImageProp,
  imageKey,
}: HeroProps) {
  const isTall = size === 'tall'
  const backgroundImage =
    backgroundImageProp ?? (imageKey ? HERO_IMAGES[imageKey] : undefined)
  return (
    <section className={getHeroSectionClassName(size)}>
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 1))',
            }}
            aria-hidden
          />
        </>
      )}
      <HeroBackground />

      <div className={getHeroInnerClassName(size)}>
        {isTall ? (
          <>
            {banner && <div className={heroBannerClassName}>{banner}</div>}
            <div className={heroContentRegionClassName}>
              <div className={heroContentClusterClassName}>
                {title && <HeroTitle title={title} titleClassName={titleClassName} />}
                {description && <p className={heroDescriptionClassName}>{description}</p>}
                {children}
              </div>
            </div>
          </>
        ) : (
          <div className="flex w-full flex-col items-center">
            {title && <HeroTitle title={title} titleClassName={titleClassName} />}
            {description && <p className={heroDescriptionClassName}>{description}</p>}
            {children}
          </div>
        )}
      </div>
    </section>
  )
}
