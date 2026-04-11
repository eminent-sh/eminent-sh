import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Projects | Categories | EMINENT',
  description: 'Browse all project categories.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 86400

export default async function ProjectCategoriesIndexPage() {
  const payload = await getPayload({ config })

  const categoriesResult = await payload.find({
    collection: 'categories',
    sort: 'name',
    limit: 100,
    depth: 0,
  })

  const categories = categoriesResult.docs

  const countResults = await Promise.all(
    categories.map((cat) =>
      payload.find({
        collection: 'projects',
        where: {
          and: [
            { _status: { equals: 'published' } },
            { category: { equals: cat.id } },
          ],
        },
        limit: 0,
        depth: 0,
      }),
    ),
  )

  const categoriesWithCounts = categories.map((cat, i) => ({
    ...cat,
    projectCount: countResults[i].totalDocs,
  }))

  return (
    <>
      <Hero variant="page" title="Categories" imageKey="projects" />

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <Breadcrumbs
          items={[
            { label: 'Projects', href: '/projects' },
            { label: 'Categories' },
          ]}
        />

        <h1 className="sr-only">Project Categories</h1>

        {categoriesWithCounts.length === 0 ? (
          <p className="text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="space-y-3">
            {categoriesWithCounts.map((cat) => (
              <Link
                key={cat.id}
                href={`/projects/category/${cat.slug}`}
                className="group flex items-start justify-between rounded-lg border border-border bg-card p-5 transition-colors hover:border-border/80 hover:bg-card/80"
              >
                <div>
                  <h2 className="font-semibold text-foreground transition-colors group-hover:text-foreground/80">
                    {cat.name}
                  </h2>
                  {cat.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                  )}
                </div>
                <span className="ml-4 shrink-0 text-sm text-muted-foreground">
                  {cat.projectCount} {cat.projectCount === 1 ? 'project' : 'projects'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
