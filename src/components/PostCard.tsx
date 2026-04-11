import React from 'react'
import Link from 'next/link'
import type { Post, Category } from '@/payload-types'

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const category = typeof post.category === 'object' ? (post.category as Category) : null
  const date = formatDate(post.publishedAt)

  return (
    <article className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-border/80 hover:bg-card/80">
      <Link href={`/blog/post/${post.slug}`} className="block">
        <h2 className="mb-2 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-foreground/80">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {category && (
            <span className="rounded-full border border-border bg-accent px-2.5 py-0.5 text-xs">
              {category.name}
            </span>
          )}
          {category && date && <span aria-hidden>·</span>}
          {date && <span>{date}</span>}
        </div>
      </Link>
    </article>
  )
}
