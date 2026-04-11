import React from 'react'
import { Github, ExternalLink } from 'lucide-react'

interface ProjectActionsProps {
  repoUrl?: string | null
  projectUrl?: string | null
}

export function ProjectActions({ repoUrl, projectUrl }: ProjectActionsProps) {
  if (!repoUrl && !projectUrl) return null

  return (
    <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-8">
      {repoUrl && (
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
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
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <ExternalLink className="h-4 w-4" />
          Visit Project
        </a>
      )}
    </div>
  )
}
