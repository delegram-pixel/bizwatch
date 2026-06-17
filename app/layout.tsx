import type { Metadata } from 'next'
import '../src/index.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'BizWatch',
  description: 'AI-powered business insights for Google Workspace',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
