import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'MyMeet AI Scrapper',
	description: 'Scrape text and images from mymeet.ai',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' className='h-full'>
			<body className={`${inter.className} antialiased h-full`}>
				{children}
			</body>
		</html>
	)
}
