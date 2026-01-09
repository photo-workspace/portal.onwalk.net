'use client'

import Link from 'next/link'

import { useOnwalkCopy } from '@/i18n/useOnwalkCopy'

export default function BlogBackLink() {
  const copy = useOnwalkCopy()

  return (
    <Link href="/blog" className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
      {copy.blog.backLabel}
    </Link>
  )
}
