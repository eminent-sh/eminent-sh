import React from 'react'
import Link from 'next/link'
import type { Post } from '@/payload-types'

export interface PostNavigationProps {
  prev?: Pick<Post, 'title' | 'slug'> | null
  next?: Pick<Post, 'title' | 'slug'> | null
}

export function PostNavigation({ prev, next }: PostNavigationProps) {
  if (!prev && !next) return null

  return (
    <nav
      aria-label="Post navigation"
      className="mt-12 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:justify-between"
    >
      <div className="flex-1">
        {prev && (
          <Link
            href={`/blog/post/${prev.slug}`}
            className="group flex flex-col gap-1 text-sm"
          >
            <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
              ← Previous post
            </span>
            <span className="font-medium text-foreground transition-colors group-hover:text-foreground/80">
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div className="flex-1 text-right">
        {next && (
          <Link
            href={`/blog/post/${next.slug}`}
            className="group flex flex-col items-end gap-1 text-sm"
          >
            <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
              Next post →
            </span>
            <span className="font-medium text-foreground transition-colors group-hover:text-foreground/80">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  )
}
