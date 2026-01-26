'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Book, User } from 'lucide-react'

const MobileFooter = () => {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/blogs', label: 'Blogs', icon: Book },
    { href: '/about', label: 'About', icon: User },
  ]

  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center ${isActive ? 'text-primary' : 'text-text-muted'}`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </footer>
  )
}

export default MobileFooter
