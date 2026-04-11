import React from 'react'
import Link from 'next/link'
import type { Category } from '@/payload-types'

export interface CategorySidebarProps {
  categories: Category[]
  activeSlug?: string
  basePath?: string
}

export function CategorySidebar({
  categories,
  activeSlug,
  basePath = '/blog',
}: CategorySidebarProps) {
  const allActive = !activeSlug
  const allLabel = basePath === '/blog' ? 'All Posts' : 'All Projects'

  return (
    <nav aria-label="Category filter">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Categories
      </p>
      <ul className="space-y-0.5">
        <li>
          <Link
            href={basePath}
            className={[
              'block rounded px-3 py-1.5 text-sm transition-colors',
              allActive
                ? 'bg-accent text-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            ].join(' ')}
          >
            {allLabel}
          </Link>
        </li>
        {categories.map((cat) => {
          const isActive = cat.slug === activeSlug
          return (
            <li key={cat.id}>
              <Link
                href={`${basePath}/category/${cat.slug}`}
                className={[
                  'block rounded px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                ].join(' ')}
              >
                {cat.name}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 border-t border-border pt-4">
        <Link
          href={`${basePath}/tags`}
          className="block px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Browse Tags →
        </Link>
        <Link
          href={`${basePath}/categories`}
          className="block px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          All Categories →
        </Link>
      </div>
    </nav>
  )
}
