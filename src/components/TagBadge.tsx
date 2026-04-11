import React from 'react'
import Link from 'next/link'
import type { Tag } from '@/payload-types'

export interface TagBadgeProps {
  tag: Tag
  size?: 'sm' | 'md'
  basePath?: string
}

export function TagBadge({ tag, size = 'sm', basePath = '/blog' }: TagBadgeProps) {
  return (
    <Link
      href={`${basePath}/tag/${tag.slug}`}
      className={[
        'inline-flex items-center rounded-full border border-border bg-accent transition-colors hover:bg-accent/70 hover:text-foreground',
        size === 'sm'
          ? 'px-2.5 py-0.5 text-xs text-muted-foreground'
          : 'px-3 py-1 text-sm text-muted-foreground',
      ].join(' ')}
    >
      {tag.name}
    </Link>
  )
}
