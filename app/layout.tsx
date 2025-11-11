import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lumivian Clinic AI Calling Agent',
  description: 'Professional Hindi AI calling agent for clinic appointments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  )
}
