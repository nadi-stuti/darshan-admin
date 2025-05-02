import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Darshan Admin Dashboard',
  description: 'Admin dashboard for managing destinations and events',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('Layout');
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
} 