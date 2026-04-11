'use client'

import React, { useState, useEffect } from 'react'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"

const navLinks = [
    { href: '/blog', label: 'Blog' },
    { href: '/projects', label: 'Projects' },
    { href: '/contact', label: 'Contact' },
]

const clientLinks = [
    { href: 'https://billing.stripe.com/p/login/9AQ3czbpK3Cpfug9AA', label: 'Log in ↗' },
]

const SCROLL_THRESHOLD = 0

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)')
        const handler = () => setMobileMenuOpen(false)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
                scrolled
                    ? 'bg-black/80 backdrop-blur-md supports-[backdrop-filter]:bg-black/60'
                    : 'bg-transparent'
            }`}
        >
            <div
                className={`max-w-7xl mx-auto transition-[padding] duration-300 ease-out ${
                    scrolled ? 'p-3 sm:p-4 lg:p-5' : 'p-4 sm:p-6 lg:p-8'
                }`}
            >
                <header className="relative mx-auto flex justify-between md:justify-start items-center">
                <div className="flex items-center md:flex-1">
                    <Link href="/" className={`block transition-transform duration-300 ease-out ${scrolled ? 'scale-[0.92]' : 'scale-100'}`}>
                        <Image
                            className="p-2"
                            src="https://media.eminent.sh/logo-text-white-transparent.webp"
                            alt="Logo"
                            width={128}
                            height={32}
                        />
                    </Link>
                </div>

                <NavigationMenu className="hidden md:flex grow-0">
                    <NavigationMenuList className={`gap-0.5 transition-[gap] duration-300 ${scrolled ? 'gap-0' : ''}`}>
                        {navLinks.map(({ href, label }) => (
                            <NavigationMenuItem key={href}>
                                <NavigationMenuLink
                                    asChild
                                    className={`${navigationMenuTriggerStyle()} transition-[font-size,padding,background-color] duration-300 ${
                                        scrolled ? 'text-[0.9375rem] py-1.5' : '!bg-transparent hover:!bg-white/10 focus:!bg-white/10 focus-visible:!bg-white/10 data-[state=open]:!bg-white/10'
                                    }`}
                                >
                                    <Link href={href}>{label}</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="hidden md:flex md:flex-1 md:justify-end md:items-center gap-1">
                    {clientLinks.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`${navigationMenuTriggerStyle()} transition-[font-size,padding,background-color] duration-300 ${
                                scrolled ? 'text-[0.9375rem] py-1.5' : '!bg-transparent hover:!bg-white/10 focus:!bg-white/10 focus-visible:!bg-white/10'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="flex md:hidden items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`transition-transform duration-300 ${scrolled ? 'scale-90' : 'scale-100'}`}
                        onClick={() => setMobileMenuOpen((o) => !o)}
                        aria-expanded={mobileMenuOpen}
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </Button>
                </div>

                {mobileMenuOpen && (
                    <nav
                        className="absolute top-full left-0 right-0 z-50 mt-0 flex flex-col border-b border-border bg-background shadow-lg md:hidden"
                        role="navigation"
                        aria-label="Mobile menu"
                    >
                        {navLinks.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {label}
                            </Link>
                        ))}
                        <div className="border-t border-border" />
                        {clientLinks.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className="px-4 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                )}
                </header>
            </div>
        </div>
    )
}
