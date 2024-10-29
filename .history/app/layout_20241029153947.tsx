import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FirebaseProvider } from '@/contexts/FirebaseContext'
import { NotificationProvider } from '@/contexts/NotificationContext'

const inter = Inter({ subsets: ['latin'] }) // Add this line

export const metadata: Metadata = {
  title: 'Energy Dataset Portal',
  description: 'AI Power Solar Energy Optimization LLM Integration DATASETS - Graduation Project 2024-2025',
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