import Link from 'next/link'
import React from 'react'

import { Hero } from '@/components/Hero'

export const metadata = {
  title: 'Contact | EMINENT',
  description:
    "Need a technical consultation or have a project in mind? Get in touch and let's discuss how we can help bring your vision to life.",
}

export default async function ContactPage() {
  return (
    <>
      <Hero
        variant="page"
        title="Contact"
        description="Need a technical consultation or have a project in mind? Get in touch and let's discuss how we can help bring your vision to life."
        imageKey="contact"
      >
        <div className="mt-10 flex flex-col items-center gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-white/70">
            Email
          </span>
          <Link
            href="mailto:support@eminent.sh"
            className="text-xl font-semibold text-white hover:underline sm:text-2xl"
          >
            support@eminent.sh
          </Link>
          <span className="mt-2 h-px w-16 bg-white/40" aria-hidden />
        </div>
      </Hero>
    </>
  )
}
