import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

type HeroVariant = 'home' | 'page'

const HERO_IMAGES = {
  home: 'https://media.eminent.sh/home-hero.jpg',
  contact: 'https://media.eminent.sh/contact-hero.jpg',
  blog: 'https://media.eminent.sh/blog-hero.jpg',
  projects: 'https://media.eminent.sh/projects-hero.jpg',
} as const

const heroInnerTallClassName =
  'relative mx-auto flex h-[50vh] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center sm:px-8 md:py-28'

const heroInnerCompactClassName =
  'relative mx-auto flex max-w-4xl flex-col items-center px-6 py-12 text-center sm:px-8 sm:py-14'

export interface HeroProps {
  variant?: HeroVariant
  /** Short heading band for filter and legal pages */
  size?: 'compact'
  title?: React.ReactNode
  description?: string
  children?: React.ReactNode
  backgroundImage?: string
  imageKey?: keyof typeof HERO_IMAGES
}

export function Hero({
  variant = 'page',
  size,
  title,
  description,
  children,
  backgroundImage: backgroundImageProp,
  imageKey,
}: HeroProps) {
  const isHome = variant === 'home'
  const isCompact = size === 'compact'
  const isTall = isHome || !isCompact
  const backgroundImage =
    backgroundImageProp ?? (imageKey ? HERO_IMAGES[imageKey] : undefined)

  return (
    <section
      className={cn(
        'relative -mt-20 w-full bg-black pt-20 text-white',
        isTall ? 'h-[calc(5rem+50vh)]' : 'min-h-0',
      )}
    >
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
      <div className={isTall ? heroInnerTallClassName : heroInnerCompactClassName}>
        {isHome ? (
          <>
            <Link
              href="/contact"
              className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:border-white/30 hover:bg-white/10"
            >
              Need a technical consultation?{' '}
              <span className="font-semibold">Get in touch →</span>
            </Link>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Bespoke Solutions for
              <br />
              Niche Requirements
            </h1>
            <p className="mt-4 text-lg text-white/80 sm:text-xl">
              DevOps · Software · Websites
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 rounded-md bg-white px-6 text-black hover:bg-white/90"
            >
              <Link href="/projects">View Projects</Link>
            </Button>
          </>
        ) : (
          <>
            {title &&
              (typeof title === 'string' ? (
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  {title}
                </h1>
              ) : (
                <div className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  {title}
                </div>
              ))}
            {description && (
              <p className="mt-4 max-w-2xl text-lg text-white/85 sm:text-xl">{description}</p>
            )}
            {children}
          </>
        )}
      </div>
    </section>
  )
}
