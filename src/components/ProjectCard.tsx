import React from 'react'
import Link from 'next/link'
import type { Project, Category } from '@/payload-types'
import { cn } from '@/lib/utils'
import { getFeaturedImageUrl } from '@/lib/featured-image'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const category =
    project.category && typeof project.category === 'object'
      ? (project.category as Category)
      : null
  const imageUrl = getFeaturedImageUrl(project.featuredImage)

  return (
    <Link
      href={`/projects/project/${project.slug}`}
      className={cn(
        'group relative flex min-h-[6.5rem] overflow-hidden rounded-lg border border-border transition-colors hover:border-border/80',
        imageUrl ? 'bg-black' : 'bg-card hover:bg-card/80',
      )}
    >
      {imageUrl && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/55 transition-colors group-hover:from-black/85 group-hover:via-black/70 group-hover:to-black/50" />
        </div>
      )}

      <div className="relative z-10 flex flex-col p-5">
        <h2
          className={cn(
            'font-semibold transition-colors',
            imageUrl
              ? 'text-white group-hover:text-white/90'
              : 'text-foreground group-hover:text-foreground/80',
          )}
        >
          {project.title}
        </h2>

        {category && (
          <span
            className={cn(
              'mt-2 text-xs font-medium',
              imageUrl ? 'text-white/75' : 'text-muted-foreground',
            )}
          >
            {category.name}
          </span>
        )}
      </div>
    </Link>
  )
}
