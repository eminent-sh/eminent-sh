import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Projects | Tags | EMINENT',
  description: 'Browse all project tags.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 86400

export default async function ProjectTagsIndexPage() {
  const payload = await getPayload({ config })

  const tagsResult = await payload.find({
    collection: 'tags',
    sort: 'name',
    limit: 500,
    depth: 0,
  })

  const tags = tagsResult.docs

  const countResults = await Promise.all(
    tags.map((tag) =>
      payload.find({
        collection: 'projects',
        where: {
          and: [
            { _status: { equals: 'published' } },
            { tags: { contains: tag.id } },
          ],
        },
        limit: 0,
        depth: 0,
      }),
    ),
  )

  const tagsWithCounts = tags.map((tag, i) => ({
    ...tag,
    projectCount: countResults[i].totalDocs,
  }))

  return (
    <>
      <Hero size="compact" title="Tags" imageKey="projects" />

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <Breadcrumbs
          items={[
            { label: 'Projects', href: '/projects' },
            { label: 'Tags' },
          ]}
        />

        <h1 className="sr-only">Project Tags</h1>

        {tagsWithCounts.length === 0 ? (
          <p className="text-muted-foreground">No tags yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tagsWithCounts.map((tag) => (
              <Link
                key={tag.id}
                href={`/projects/tag/${tag.slug}`}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-border/80 hover:bg-card/80"
              >
                <span className="text-foreground transition-colors group-hover:text-foreground/80">
                  #{tag.name}
                </span>
                <span className="text-xs text-muted-foreground">{tag.projectCount}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
