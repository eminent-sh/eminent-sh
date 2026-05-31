import React from 'react'
import Link from "next/link"

export function Footer() {
    return (
        <footer
            className="w-full fixed bottom-0 bg-black"
        >
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex justify-between items-center text-sm text-muted-foreground">
                <div>
                    <p>EMINENT MEDIA LLC © {new Date().getFullYear()}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                    <Link href="/terms" className="hover:underline">Terms of Service</Link>
                </div>
            </div>
        </footer>
    )
}
