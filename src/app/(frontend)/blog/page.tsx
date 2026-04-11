import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { ContentLayout } from '@/components/ContentLayout'
import { CategorySidebar } from '@/components/CategorySidebar'
import { PostCard } from '@/components/PostCard'

export const metadata: Metadata = {
  title: 'Blog | EMINENT',
  description: 'Technical articles, case studies, and project deep-dives by EMINENT.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 86400

const POSTS_PER_PAGE = 10

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const payload = await getPayload({ config })

  const [postsResult, categories] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 1,
      limit: POSTS_PER_PAGE,
      page,
    }),
    payload.find({
      collection: 'categories',
      sort: 'name',
      limit: 100,
      depth: 0,
    }),
  ])

  const { docs: posts, totalPages, hasPrevPage, hasNextPage } = postsResult

  return (
    <>
      <Hero variant="page" title="Blog" imageKey="blog" />

      <ContentLayout
        sidebar={<CategorySidebar categories={categories.docs} />}
      >
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts published yet.</p>
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
                href={`/blog?page=${page - 1}`}
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
                href={`/blog?page=${page + 1}`}
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
