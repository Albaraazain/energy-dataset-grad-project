import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FirebaseProvider } from '@/contexts/FirebaseContext'

const inter = Inter({ subsets: ['latin'] }) // Add this line

export const metadata: Metadata = {
  title: 'Energy Dataset Portal',
  description: 'Explore comprehensive energy data resources for research and analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </FirebaseProvider>
      </body>
    </html>
  )
}