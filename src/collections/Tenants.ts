import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'domain', 'updatedAt'],
    description: 'Organizations or sites that own content in this multi-tenant installation.',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for this tenant.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-safe identifier used to filter content by tenant.',
      },
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      admin: {
        description: 'Primary domain for this tenant (e.g. example.com).',
      },
    },
  ],
  timestamps: true,
}
