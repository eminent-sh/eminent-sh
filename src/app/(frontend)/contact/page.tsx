import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { Hero } from '@/components/Hero'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'
export const revalidate = 86400

export default async function ContactPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  await payload.auth({ headers })

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
