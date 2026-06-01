import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Hero } from '@/components/Hero'
import { HERO_SIZE_SPLASH } from '@/components/hero-layout'

export default async function HomePage() {
  return (
    <Hero
      size={HERO_SIZE_SPLASH}
      imageKey="home"
      titleClassName="lg:text-7xl"
      banner={
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:border-white/30 hover:bg-white/10"
        >
          Need a technical consultation?{' '}
          <span className="font-semibold">Get in touch →</span>
        </Link>
      }
      title={
        <>
          Bespoke Solutions for
          <br />
          Niche Requirements
        </>
      }
    >
      <p className="text-lg text-white/80 sm:text-xl">DevOps · Software · Websites</p>
      <Button
        asChild
        size="lg"
        className="rounded-md bg-white px-6 text-black hover:bg-white/90"
      >
        <Link href="/projects">View Projects</Link>
      </Button>
    </Hero>
  )
}
