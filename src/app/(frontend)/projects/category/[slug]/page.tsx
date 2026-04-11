import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { ContentLayout } from '@/components/ContentLayout'
import { CategorySidebar } from '@/components/CategorySidebar'
import { ProjectCard } from '@/components/ProjectCard'

const PROJECTS_PER_PAGE = 12

export const dynamic = 'force-dynamic'
export const revalidate = 86400

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })

  const category = result.docs[0]
  if (!category) return {}

  return {
    title: `Projects | ${category.name} | EMINENT`,
    description: category.description ?? `Projects in the ${category.name} category.`,
  }
}

export default async function ProjectCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const payload = await getPayload({ config })

  const [categoryResult, allCategories] = await Promise.all([
    payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    }),
    payload.find({
      collection: 'categories',
      sort: 'name',
      limit: 100,
      depth: 0,
    }),
  ])

  const category = categoryResult.docs[0]
  if (!category) notFound()

  const projectsResult = await payload.find({
    collection: 'projects',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { category: { equals: category.id } },
      ],
    },
    sort: '-publishedAt',
    depth: 1,
    limit: PROJECTS_PER_PAGE,
    page,
  })

  const { docs: projects, totalPages, hasPrevPage, hasNextPage } = projectsResult

  return (
    <>
      <Hero
        variant="page"
        title={`Projects / ${category.name}`}
        description={category.description ?? undefined}
        imageKey="projects"
      />

      <ContentLayout
        sidebar={
          <CategorySidebar
            categories={allCategories.docs}
            activeSlug={slug}
            basePath="/projects"
          />
        }
      >
        {projects.length === 0 ? (
          <p className="text-muted-foreground">No projects in this category yet.</p>
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
                href={`/projects/category/${slug}?page=${page - 1}`}
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
                href={`/projects/category/${slug}?page=${page + 1}`}
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
