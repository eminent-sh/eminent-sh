import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'author', 'publishedAt', 'updatedAt'],
    description: 'Blog posts. SEO fields (meta title, description, image, keywords) are provided by the SEO plugin.',
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
        description: 'Post headline. Used for slug auto-generation and SEO fallbacks.',
      },
    },
    slugField({ useAsSlug: 'title' }),
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary for listings and for meta description when not overridden in the SEO tab.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Main post body.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Used as the default meta/og image when not set in the SEO tab.',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        description: 'Primary category for this post.',
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
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Post author.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When the post was or will be published. Optional.',
      },
    },
    {
      name: 'schema',
      type: 'json',
      admin: {
        description:
          'Optional custom JSON-LD (e.g. Article, BlogPosting). Injected as <script type="application/ld+json">. Leave empty to skip.',
      },
    },
  ],
  timestamps: true,
}
