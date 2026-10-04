import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { ContentLayout } from '@/components/ContentLayout'
import { CategorySidebar } from '@/components/CategorySidebar'
import { PostCard } from '@/components/PostCard'

const POSTS_PER_PAGE = 10

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
    title: `Blog | ${category.name} | EMINENT`,
    description: category.description ?? `Posts in the ${category.name} category.`,
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
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

  const postsResult = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { category: { equals: category.id } },
      ],
    },
    sort: '-publishedAt',
    depth: 1,
    limit: POSTS_PER_PAGE,
    page,
  })

  const { docs: posts, totalPages, hasPrevPage, hasNextPage } = postsResult

  return (
    <>
      <Hero
        title={`Blog / ${category.name}`}
        description={category.description ?? undefined}
        imageKey="blog"
      />

      <ContentLayout
        sidebar={<CategorySidebar categories={allCategories.docs} activeSlug={slug} />}
      >
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts in this category yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-sm">
            {hasPrevPage ? (
              <Link
                href={`/blog/category/${slug}?page=${page - 1}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                ← Newer posts
              </Link>
            ) : (
              <span />
            )}
            <span className="text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            {hasNextPage ? (
              <Link
                href={`/blog/category/${slug}?page=${page + 1}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Older posts →
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
