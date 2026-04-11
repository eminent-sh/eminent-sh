import React from 'react'
import type { Metadata } from 'next'
import { Hero } from '@/components/Hero'

export const metadata: Metadata = {
  title: 'Privacy Policy | EMINENT',
  description: 'Privacy Policy for EMINENT MEDIA LLC.',
}

export default function PrivacyPage() {
  return (
    <>
      <Hero variant="page" title="Privacy Policy" />

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <div className="prose prose-invert prose-sm max-w-none sm:prose-base">
          <p className="text-sm text-muted-foreground">Last updated: April 11, 2026</p>

          <h2>Introduction</h2>
          <p>
            This Privacy Policy describes how EMINENT MEDIA LLC (&quot;we,&quot; &quot;our,&quot; or
            &quot;us&quot;) collects, uses, and protects information when you visit our website. This
            site serves as an index of our company&apos;s projects, service offerings, links to
            services, and other ventures.
          </p>

          <h2>Information We Collect</h2>
          <p>
            When you interact with forms on our website, we may collect the following information:
          </p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number (when provided)</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>
            Information collected through forms on this website is not stored in a database. Instead,
            this information may be:
          </p>
          <ul>
            <li>
              Forwarded via email notifications through third-party email service providers
            </li>
            <li>Forwarded via SMS notifications through third-party SMS service providers</li>
          </ul>
          <p>
            We use this information solely to respond to your inquiries and provide the services you
            request.
          </p>

          <h2>Cookies</h2>
          <p>
            This website does not serve cookies beyond the standard browser cookies that may be
            supplied by third-party services integrated into the site. These third-party cookies are
            subject to their respective privacy policies.
          </p>

          <h2>Third-Party Services</h2>
          <p>Our website may integrate with third-party services, including:</p>
          <ul>
            <li>
              Payment processing services (billing pages are served externally via a third-party
              payment provider)
            </li>
            <li>Email and SMS notification services</li>
            <li>Other services that may set standard browser cookies</li>
          </ul>
          <p>
            These third-party services have their own privacy policies governing the collection and
            use of your information.
          </p>

          <h2>Data Security</h2>
          <p>
            While we do not store your information in a database, we take reasonable measures to
            protect information transmitted through our website. However, no method of transmission
            over the Internet is 100% secure.
          </p>

          <h2>Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us:</p>
          <p>
            <strong>EMINENT MEDIA LLC</strong>
            <br />
            Email: support@eminent.sh
            <br />
            Phone: +1 (802) 949-0841
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the &quot;Last updated&quot;
            date.
          </p>
        </div>
      </div>
    </>
  )
}
