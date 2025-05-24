'use client'

import { useState } from 'react'
import { GridPattern } from './ui/GridPattern'
import clsx from 'clsx'
import { TextAnimate } from './ui/TextAnimate'
import Image from 'next/image'
import { HoverCard } from './ui/HoverCard'
import { Button } from './ui/button'
import { motion } from 'framer-motion'
import { ShiningText } from './ui/ShiningText'
import Link from 'next/link'

type ScrapeResult = {
	success: boolean
	data?: {
		success: boolean
		imageUrls: string[]
		downloadedImages: string[]
		errors?: { url: string; error: unknown }[]
		textFile: string
		sessionId: string
	}
	error?: string
}

export default function Page() {
	const [isLoading, setIsLoading] = useState(false)
	const [isDownloading, setIsDownloading] = useState(false)
	const [result, setResult] = useState<ScrapeResult | null>(null)
	const [uiStatus, setUiStatus] = useState<'idle' | 'loading' | 'ready'>('idle')

	const handleScrape = async () => {
		try {
			setIsLoading(true)
			setUiStatus('loading')
			setResult(null)

			const response = await fetch('/api/scrape')
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Произошла ошибка при скрапинге')
			}

			setResult(data)
			setUiStatus('ready')
		} catch (error) {
			setResult({
				success: false,
				error: error instanceof Error ? error.message : 'Неизвестная ошибка',
			})
			setUiStatus('idle')
		} finally {
			setIsLoading(false)
		}
	}

	const handleDownload = async () => {
		if (!result?.data?.sessionId) return

		try {
			setIsDownloading(true)

			const downloadUrl = `/api/download?sessionId=${result.data.sessionId}`

			const link = document.createElement('a')
			link.href = downloadUrl
			link.setAttribute('download', `mymeet-data-${result.data.sessionId}.zip`)
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			setUiStatus('idle')
			setResult(null)
		} catch (error) {
			console.error('Ошибка при скачивании:', error)
		} finally {
			setIsDownloading(false)
		}
	}

	return (
		<div className='relative min-h-screen overflow-hidden bg-black flex items-center justify-center'>
			<GridPattern
				className={clsx(
					'[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)]',
					'inset-0 h-full opacity-40'
				)}
			/>

			<div className='absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center justify-center items-center flex flex-col gap-4'>
				<div className='text-white text-7xl font-bold flex'>
					<TextAnimate animation='blurInUp' by='character' once>
						MyMeet AI Scrapper
					</TextAnimate>
				</div>
				<div className='text-white text-xl font-medium flex opacity-80'>
					<TextAnimate animation='blurInUp' by='character' once>
						Выполненное тестовое задание от Егора Никандрова
					</TextAnimate>
				</div>
			</div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0, z: 100 }}
				transition={{ duration: 0.4, delay: 0.4 }}
			>
				<HoverCard className='p-4 flex flex-col gap-3'>
					<div className='flex items-center gap-2'>
						<Image src='/tools.svg' alt='tools' width={24} height={24} />
						<p className='text-white text-xl font-medium'>
							Результат выполненного задания
						</p>
					</div>
					<hr className='border-gray-200 h-1 w-full opacity-20' />
					<p className='text-sm font-medium'>
						В ходе выполнения задания было реализовано следующее:
					</p>
					<ul className='text-sm font-medium list-disc list-inside mb-3'>
						<li>Скрапинг текста/изображений с сайта https://mymeet.ai/</li>
						<li>Скачивание данных в формате zip</li>
						<li>Составление блок-схемы архитектуры веб-приложения mymeet.ai</li>
					</ul>
					<div className='flex items-center gap-3'>
						{uiStatus === 'loading' && (
							<Button>
								<ShiningText />
							</Button>
						)}
						{uiStatus === 'idle' && (
							<Button
								onClick={handleScrape}
								disabled={isLoading || isDownloading}
							>
								Парсинг
							</Button>
						)}
						{uiStatus === 'ready' && (
							<Button onClick={handleDownload} disabled={isDownloading}>
								Скачать
							</Button>
						)}
						<Link
							href='https://www.mermaidchart.com/raw/72e6495c-a884-45f7-b276-79f9f12269d5?theme=light&version=v0.1&format=svg'
							target='_blank'
							className='hover:underline'
						>
							<p className='text-white text-xs font-medium'>Схема</p>
						</Link>
					</div>
				</HoverCard>
			</motion.div>
		</div>
	)
}
