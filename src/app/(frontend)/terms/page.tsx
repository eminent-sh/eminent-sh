import React from 'react'
import type { Metadata } from 'next'
import { Hero } from '@/components/Hero'

export const metadata: Metadata = {
  title: 'Terms of Service | EMINENT',
  description: 'Terms of Service for EMINENT MEDIA LLC.',
}

export default function TermsPage() {
  return (
    <>
      <Hero variant="page" title="Terms of Service" />

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <div className="prose prose-invert prose-sm max-w-none sm:prose-base">
          <p className="text-sm text-muted-foreground">Last updated: April 11, 2026</p>

          <h2>Agreement to Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by the terms and
            provision of this agreement. If you do not agree to abide by the above, please do not
            use this service.
          </p>

          <h2>Use License</h2>
          <p>
            This website is operated by EMINENT MEDIA LLC and serves as an index of our
            company&apos;s projects, service offerings, links to services, and other ventures.
            Permission is granted to temporarily access the materials on this website for personal,
            non-commercial transitory viewing only.
          </p>
          <p>
            This license shall automatically terminate if you violate any of these restrictions and
            may be terminated by EMINENT MEDIA LLC at any time.
          </p>

          <h2>Website Content</h2>
          <p>
            The materials on this website are provided on an &quot;as is&quot; basis. EMINENT MEDIA
            LLC makes no warranties, expressed or implied, and hereby disclaims and negates all other
            warranties including, without limitation, implied warranties or conditions of
            merchantability, fitness for a particular purpose, or non-infringement of intellectual
            property or other violation of rights.
          </p>

          <h2>Third-Party Services</h2>
          <p>This website may contain links to third-party services, including:</p>
          <ul>
            <li>
              External payment processing services (billing pages are served externally via a
              third-party payment provider)
            </li>
            <li>Other external services and websites</li>
          </ul>
          <p>
            EMINENT MEDIA LLC is not responsible for the content, privacy policies, or practices of
            any third-party services. Your use of third-party services is subject to their respective
            terms of service and privacy policies.
          </p>

          <h2>Limitations</h2>
          <p>
            In no event shall EMINENT MEDIA LLC or its suppliers be liable for any damages
            (including, without limitation, damages for loss of data or profit, or due to business
            interruption) arising out of the use or inability to use the materials on this website,
            even if EMINENT MEDIA LLC or an authorized representative has been notified orally or in
            writing of the possibility of such damage.
          </p>

          <h2>Accuracy of Materials</h2>
          <p>
            The materials appearing on this website could include technical, typographical, or
            photographic errors. EMINENT MEDIA LLC does not warrant that any of the materials on its
            website are accurate, complete, or current. EMINENT MEDIA LLC may make changes to the
            materials contained on its website at any time without notice.
          </p>

          <h2>Modifications</h2>
          <p>
            EMINENT MEDIA LLC may revise these terms of service for its website at any time without
            notice. By using this website you are agreeing to be bound by the then current version of
            these terms of service.
          </p>

          <h2>Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <p>
            <strong>EMINENT MEDIA LLC</strong>
            <br />
            Email: support@eminent.sh
            <br />
            Phone: +1 (802) 949-0841
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with applicable
            laws, and you irrevocably submit to the exclusive jurisdiction of the courts in that
            location.
          </p>
        </div>
      </div>
    </>
  )
}
