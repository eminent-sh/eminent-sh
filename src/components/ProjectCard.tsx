import React from 'react'
import Link from 'next/link'
import type { Project, Category } from '@/payload-types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const category =
    project.category && typeof project.category === 'object'
      ? (project.category as Category)
      : null

  return (
    <Link
      href={`/projects/project/${project.slug}`}
      className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-border/80 hover:bg-card/80"
    >
      <h2 className="font-semibold text-foreground transition-colors group-hover:text-foreground/80">
        {project.title}
      </h2>

      {category && (
        <span className="mt-2 text-xs font-medium text-muted-foreground">
          {category.name}
        </span>
      )}
    </Link>
  )
}
