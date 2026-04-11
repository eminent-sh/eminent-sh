import React from 'react'

export interface ContentLayoutProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export function ContentLayout({ sidebar, children }: ContentLayoutProps) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
      <div className="flex flex-col gap-10 md:flex-row md:gap-12">
        <aside className="shrink-0 md:w-48">{sidebar}</aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
