import type { Metadata } from 'next'
import { Inter} from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { cn } from "@/lib/utils";


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'СӨБ Систем',
  description: 'Сургуулийн өмнөх боловсролын байгууллагын нэгдсэн мэдээллийн систем',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mn">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}