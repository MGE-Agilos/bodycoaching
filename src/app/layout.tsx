import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BodyCoaching — Triathlon Training App',
  description: 'Track your triathlon training: workouts, nutrition, goals, and analytics — all offline, stored locally.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
