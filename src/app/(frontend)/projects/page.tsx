import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { ContentLayout } from '@/components/ContentLayout'
import { CategorySidebar } from '@/components/CategorySidebar'
import { ProjectCard } from '@/components/ProjectCard'

export const metadata: Metadata = {
  title: 'Projects | EMINENT',
  description: 'A collection of projects built by EMINENT.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 86400

const PROJECTS_PER_PAGE = 12

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ProjectsIndexPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const payload = await getPayload({ config })

  const [projectsResult, categories] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 1,
      limit: PROJECTS_PER_PAGE,
      page,
    }),
    payload.find({
      collection: 'categories',
      sort: 'name',
      limit: 100,
      depth: 0,
    }),
  ])

  const { docs: projects, totalPages, hasPrevPage, hasNextPage } = projectsResult

  return (
    <>
      <Hero variant="page" title="Projects" imageKey="projects" />

      <ContentLayout sidebar={<CategorySidebar categories={categories.docs} basePath="/projects" />}>
        {projects.length === 0 ? (
          <p className="text-muted-foreground">No projects published yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-sm">
            {hasPrevPage ? (
              <Link
                href={`/projects?page=${page - 1}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                ← Newer
              </Link>
            ) : (
              <span />
            )}
            <span className="text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            {hasNextPage ? (
              <Link
                href={`/projects?page=${page + 1}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Older →
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </ContentLayout>
    </>
  )
}
