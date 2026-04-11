import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedHeadingNode } from '@payloadcms/richtext-lexical'
import type { Category, Media, Tag, User, Post } from '@/payload-types'
import { Hero } from '@/components/Hero'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { TagBadge } from '@/components/TagBadge'
import { TableOfContents, extractHeadings } from '@/components/TableOfContents'
import { PostNavigation } from '@/components/PostNavigation'

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

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
    collection: 'posts',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    depth: 1,
    limit: 1,
    select: { title: true, excerpt: true, meta: true, featuredImage: true },
  })

  const post = result.docs[0]
  if (!post) return {}

  const title = post.meta?.title ?? `${post.title} | EMINENT`
  const description = post.meta?.description ?? post.excerpt ?? undefined
  const ogImage =
    post.meta?.image && typeof post.meta.image === 'object'
      ? { url: (post.meta.image as Media).url ?? '' }
      : post.featuredImage && typeof post.featuredImage === 'object'
        ? { url: (post.featuredImage as Media).url ?? '' }
        : undefined

  return {
    title,
    description,
    openGraph: ogImage ? { images: [ogImage] } : undefined,
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    depth: 2,
    limit: 1,
  })

  const post = result.docs[0]
  if (!post) notFound()

  const category = typeof post.category === 'object' ? (post.category as Category) : null
  const author = typeof post.author === 'object' ? (post.author as User) : null
  const tags = (post.tags ?? []).filter((t): t is Tag => typeof t === 'object')

  const authorName = author?.email
    ? author.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null

  const date = formatDate(post.publishedAt)

  const headings = post.content ? extractHeadings(post.content) : []

  const [prevResult, nextResult] = await Promise.all([
    post.publishedAt
      ? payload.find({
          collection: 'posts',
          where: {
            and: [
              { _status: { equals: 'published' } },
              { publishedAt: { less_than: post.publishedAt } },
            ],
          },
          sort: '-publishedAt',
          limit: 1,
          depth: 0,
          select: { title: true, slug: true },
        })
      : null,
    post.publishedAt
      ? payload.find({
          collection: 'posts',
          where: {
            and: [
              { _status: { equals: 'published' } },
              { publishedAt: { greater_than: post.publishedAt } },
            ],
          },
          sort: 'publishedAt',
          limit: 1,
          depth: 0,
          select: { title: true, slug: true },
        })
      : null,
  ])

  const prevPost = prevResult?.docs[0] ?? null
  const nextPost = nextResult?.docs[0] ?? null

  return (
    <>
      <Hero variant="page" title={post.title} imageKey="blog" />

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <Breadcrumbs
          items={[
            { label: 'Blog', href: '/blog' },
            ...(category
              ? [{ label: category.name, href: `/blog/category/${category.slug}` }]
              : []),
          ]}
        />

        <header className="mb-8">
          <h1 className="sr-only">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {date && <span>{date}</span>}
            {authorName && (
              <>
                <span aria-hidden>·</span>
                <span>by {authorName}</span>
              </>
            )}
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          )}
        </header>

        <TableOfContents headings={headings} />

        {post.content && (
          <div className="prose prose-invert prose-sm max-w-none sm:prose-base">
            <RichText
              data={post.content as unknown as Parameters<typeof RichText>[0]['data']}
              converters={richTextConverters}
            />
          </div>
        )}

        {(category || tags.length > 0) && (
          <footer className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
            {category && (
              <p>
                Filed under:{' '}
                <a
                  href={`/blog/category/${category.slug}`}
                  className="transition-colors hover:text-foreground"
                >
                  {category.name}
                </a>
              </p>
            )}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span>Tags:</span>
                {tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </footer>
        )}

        <PostNavigation prev={prevPost} next={nextPost} />
      </div>
    </>
  )
}
