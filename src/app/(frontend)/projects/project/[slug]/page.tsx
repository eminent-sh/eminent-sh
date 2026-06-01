import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedHeadingNode } from '@payloadcms/richtext-lexical'
import type { Category, Media, Tag } from '@/payload-types'
import { Hero } from '@/components/Hero'
import { getFeaturedImageUrl } from '@/lib/featured-image'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { TagBadge } from '@/components/TagBadge'
import { ProjectActions } from '@/components/ProjectActions'

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function extractNodeText(nodes: unknown[]): string {
  return (nodes as Array<{ type: string; text?: string; children?: unknown[] }>)
    .map((n) => {
      if (n.type === 'text') return n.text ?? ''
      if (Array.isArray(n.children)) return extractNodeText(n.children)
      return ''
    })
    .join('')
}

const richTextConverters: JSXConvertersFunction = ({ defaultConverters }) => {
  const headingSlugCounts = new Map<string, number>()

  return {
    ...defaultConverters,
    heading: ({ node, nodesToJSX, converters }) => {
      const headingNode = node as SerializedHeadingNode
      const Tag = headingNode.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      const text = extractNodeText(headingNode.children as unknown[])
      const base = slugifyHeading(text)
      const count = headingSlugCounts.get(base) ?? 0
      headingSlugCounts.set(base, count + 1)
      const id = count === 0 ? base : `${base}-${count}`

      return (
        <Tag id={id} className="scroll-mt-20">
          {nodesToJSX({ nodes: headingNode.children, converters })}
        </Tag>
      )
    },
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 86400

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    depth: 1,
    limit: 1,
    select: { title: true, excerpt: true, featuredImage: true },
  })

  const project = result.docs[0]
  if (!project) return {}

  const title = `${project.title} | Projects | EMINENT`
  const description = project.excerpt ?? undefined
  const ogImage =
    project.featuredImage && typeof project.featuredImage === 'object'
      ? { url: (project.featuredImage as Media).url ?? '' }
      : undefined

  return {
    title,
    description,
    openGraph: ogImage ? { images: [ogImage] } : undefined,
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    depth: 2,
    limit: 1,
  })

  const project = result.docs[0]
  if (!project) notFound()

  const category = typeof project.category === 'object' ? (project.category as Category) : null
  const tags = (project.tags ?? []).filter((t): t is Tag => typeof t === 'object')
  const featuredImageUrl = getFeaturedImageUrl(project.featuredImage)

  const [prevResult, nextResult] = await Promise.all([
    project.publishedAt
      ? payload.find({
          collection: 'projects',
          where: {
            and: [
              { _status: { equals: 'published' } },
              { publishedAt: { less_than: project.publishedAt } },
            ],
          },
          sort: '-publishedAt',
          limit: 1,
          depth: 0,
          select: { title: true, slug: true },
        })
      : null,
    project.publishedAt
      ? payload.find({
          collection: 'projects',
          where: {
            and: [
              { _status: { equals: 'published' } },
              { publishedAt: { greater_than: project.publishedAt } },
            ],
          },
          sort: 'publishedAt',
          limit: 1,
          depth: 0,
          select: { title: true, slug: true },
        })
      : null,
  ])

  const prevProject = prevResult?.docs[0] ?? null
  const nextProject = nextResult?.docs[0] ?? null

  return (
    <>
      <Hero
        variant="page"
        title={project.title}
        backgroundImage={featuredImageUrl ?? undefined}
        imageKey="projects"
      >
        <ProjectActions
          variant="hero"
          repoUrl={project.repoUrl}
          projectUrl={project.projectUrl}
        />
      </Hero>

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <Breadcrumbs
          items={[
            { label: 'Projects', href: '/projects' },
            ...(category
              ? [{ label: category.name, href: `/projects/category/${category.slug}` }]
              : []),
          ]}
        />

        {tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} basePath="/projects" />
            ))}
          </div>
        )}

        {project.excerpt && (
          <p className="mb-8 text-lg text-muted-foreground">{project.excerpt}</p>
        )}

        {project.content && (
          <div className="prose prose-invert prose-sm max-w-none sm:prose-base">
            <RichText
              data={project.content as unknown as Parameters<typeof RichText>[0]['data']}
              converters={richTextConverters}
            />
          </div>
        )}

        {(prevProject || nextProject) && (
          <nav
            aria-label="Project navigation"
            className="mt-12 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:justify-between"
          >
            <div className="flex-1">
              {prevProject && (
                <Link
                  href={`/projects/project/${prevProject.slug}`}
                  className="group flex flex-col gap-1 text-sm"
                >
                  <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                    ← Previous project
                  </span>
                  <span className="font-medium text-foreground transition-colors group-hover:text-foreground/80">
                    {prevProject.title}
                  </span>
                </Link>
              )}
            </div>
            <div className="flex-1 text-right">
              {nextProject && (
                <Link
                  href={`/projects/project/${nextProject.slug}`}
                  className="group flex flex-col items-end gap-1 text-sm"
                >
                  <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                    Next project →
                  </span>
                  <span className="font-medium text-foreground transition-colors group-hover:text-foreground/80">
                    {nextProject.title}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </>
  )
}
