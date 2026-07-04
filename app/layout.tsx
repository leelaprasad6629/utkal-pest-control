import React from 'react'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { TAGLINE } from '../config/business'

export const metadata = {
  title: 'Utkal Pest Control',
  description: TAGLINE
}

export default function RootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body>
          <div className="min-h-screen">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
