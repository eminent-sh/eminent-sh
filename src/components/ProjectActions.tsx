import React from 'react'
import { Github, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectActionsProps {
  repoUrl?: string | null
  projectUrl?: string | null
  variant?: 'default' | 'hero'
}

const buttonBase =
  'inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors'

export function ProjectActions({ repoUrl, projectUrl, variant = 'default' }: ProjectActionsProps) {
  if (!repoUrl && !projectUrl) return null

  const isHero = variant === 'hero'

  return (
    <div
      className={cn(
        'flex flex-wrap gap-3',
        isHero
          ? 'mt-6 justify-center'
          : 'mt-10 border-t border-border pt-8',
      )}
    >
      {repoUrl && (
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonBase,
            isHero
              ? 'border border-white/25 bg-white/10 text-white hover:bg-white/20'
              : 'border border-border bg-card text-foreground hover:bg-accent',
          )}
        >
          <Github className="h-4 w-4" />
          View Repository
        </a>
      )}
      {projectUrl && (
        <a
          href={projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonBase,
            isHero
              ? 'bg-white text-black hover:bg-white/90'
              : 'border border-border bg-card text-foreground hover:bg-accent',
          )}
        >
          <ExternalLink className="h-4 w-4" />
          Visit Project
        </a>
      )}
    </div>
  )
}
