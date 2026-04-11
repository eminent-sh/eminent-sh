import React from 'react'
import type { Post } from '@/payload-types'

type LexicalNode = { type: string; text?: string; tag?: string; children?: LexicalNode[] }
type LexicalContent = Post['content']

export interface TocHeading {
  id: string
  text: string
  level: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function extractTextFromNodes(nodes: LexicalNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') return node.text ?? ''
      if (Array.isArray(node.children)) return extractTextFromNodes(node.children)
      return ''
    })
    .join('')
}

export function extractHeadings(content: LexicalContent): TocHeading[] {
  const root = content?.root
  if (!root || !Array.isArray(root.children)) return []

  const headings: TocHeading[] = []
  const seen = new Map<string, number>()

  for (const node of root.children as LexicalNode[]) {
    if (node.type !== 'heading') continue
    const tag = node.tag
    if (tag !== 'h2' && tag !== 'h3') continue

    const text = extractTextFromNodes(node.children ?? [])
    if (!text.trim()) continue

    const base = slugify(text)
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    const id = count === 0 ? base : `${base}-${count}`

    headings.push({ id, text: text.trim(), level: parseInt(tag[1], 10) })
  }

  return headings
}

export interface TableOfContentsProps {
  headings: TocHeading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) return null

  return (
    <nav
      aria-label="Table of contents"
      className="mb-10 rounded-lg border border-border bg-card p-5"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Index
      </p>
      <ol className="space-y-1.5">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: heading.level === 3 ? '1rem' : '0' }}
          >
            <a
              href={`#${heading.id}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
