import crypto from 'crypto'
import fs from 'fs/promises'
import fetch from 'node-fetch'
import path from 'path'
import puppeteer from 'puppeteer-core'

const IMAGES_DIR = path.join('/tmp', 'images')
const TEXT_DIR = path.join('/tmp', 'text')
const DATA_DIR = '/tmp'

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN
const BROWSERLESS_ENDPOINT = `wss://production-sfo.browserless.io/?token=${BROWSERLESS_TOKEN}&stealth=true`

const hash = (text: string) =>
	crypto.createHash('md5').update(text).digest('hex').slice(0, 8)

const downloadImage = async (url: string, filename: string) => {
	const res = await fetch(url)
	if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
	const buffer = Buffer.from(await res.arrayBuffer())
	await fs.writeFile(path.join(IMAGES_DIR, filename), buffer)
	return filename
}

export async function scrapeMyMeetAI() {
	if (!BROWSERLESS_TOKEN) {
		throw new Error('BROWSERLESS_TOKEN environment variable is required')
	}

	await fs.mkdir(IMAGES_DIR, { recursive: true })
	await fs.mkdir(TEXT_DIR, { recursive: true })

	// I use browserless because puppeteer's built-in chromium is too big for serverless

	const browser = await puppeteer.connect({
		browserWSEndpoint: BROWSERLESS_ENDPOINT,
	})

	try {
		const page = await browser.newPage()
		await page.goto('https://mymeet.ai/', {
			waitUntil: 'domcontentloaded',
			timeout: 30000,
		})
		await page.waitForSelector('img', { timeout: 10000 })

		const sessionId = new Date().toISOString().replace(/[:.]/g, '-')

		const imgUrls: string[] = await page.$$eval('img', imgs =>
			imgs
				.map(img => img.src)
				.filter(
					src => src && !src.startsWith('data:') && /^https?:\/\//.test(src)
				)
		)

		const results = await Promise.allSettled(
			imgUrls.map(async url => {
				const ext = path.extname(new URL(url).pathname) || '.jpg'
				const filename = `img_${hash(url)}${ext}`
				return await downloadImage(url, filename)
			})
		)

		const downloadedImages = results
			.filter(r => r.status === 'fulfilled')
			.map(r => (r as PromiseFulfilledResult<string>).value)
		const errors = results
			.filter(r => r.status === 'rejected')
			.map((r, i) => ({
				url: imgUrls[i],
				error: (r as PromiseRejectedResult).reason,
			}))

		const pageText: string = await page.evaluate(
			() => document.body.innerText || ''
		)

		const textFileName = `mymeetai_${sessionId}.txt`
		const textFilePath = path.join(TEXT_DIR, textFileName)

		await fs.writeFile(textFilePath, pageText, 'utf-8')

		return {
			success: downloadedImages.length > 0,
			imageUrls: imgUrls,
			downloadedImages,
			errors: errors.length ? errors : undefined,
			textFile: textFileName,
			sessionId,
			dataDirectory: {
				images: IMAGES_DIR,
				text: TEXT_DIR,
				root: DATA_DIR,
			},
		}
	} finally {
		await browser.close()
	}
}
