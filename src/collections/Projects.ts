import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'publishedAt', 'updatedAt'],
    description: 'Portfolio projects. SEO fields are provided by the SEO plugin.',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Project name. Used for slug auto-generation and SEO fallbacks.',
      },
    },
    slugField({ useAsSlug: 'title' }),
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary for listings and meta description fallback.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'Optional longer project description.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Splash image shown at the top of the project detail page.',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        description: 'Primary category for this project.',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        description: 'Optional tags for cross-cutting topics.',
      },
    },
    {
      name: 'repoUrl',
      type: 'text',
      admin: {
        description: 'GitHub or other repository URL. Displays a "View Repository" button.',
      },
    },
    {
      name: 'projectUrl',
      type: 'text',
      admin: {
        description: 'Live project URL. Displays a "Visit Project" button.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When the project was or will be published. Optional.',
      },
    },
    {
      name: 'schema',
      type: 'json',
      admin: {
        description:
          'Optional custom JSON-LD. Injected as <script type="application/ld+json">. Leave empty to skip.',
      },
    },
  ],
  timestamps: true,
}
