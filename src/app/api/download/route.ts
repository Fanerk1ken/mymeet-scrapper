import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'

export async function GET(request: NextRequest) {
	console.log('test')
	try {
		const { searchParams } = new URL(request.url)
		const sessionId = searchParams.get('sessionId')

		if (!sessionId) {
			return NextResponse.json(
				{ success: false, error: 'Session ID is required' },
				{ status: 400 }
			)
		}

		const archive = archiver('zip', {
			zlib: { level: 9 },
		})

		const dataDir = path.resolve('public/data')
		const imagesDir = path.join(dataDir, 'images')
		const textDir = path.join(dataDir, 'text')

		if (fs.existsSync(imagesDir)) {
			const imageFiles = fs.readdirSync(imagesDir)
			for (const file of imageFiles) {
				const filePath = path.join(imagesDir, file)
				archive.append(fs.createReadStream(filePath), {
					name: `images/${file}`,
				})
			}
		}

		if (fs.existsSync(textDir)) {
			const textFiles = fs.readdirSync(textDir)
			for (const file of textFiles) {
				if (file.includes(sessionId) || !sessionId.includes('-')) {
					const filePath = path.join(textDir, file)
					archive.append(fs.createReadStream(filePath), {
						name: `text/${file}`,
					})
				}
			}
		}

		return new Promise<NextResponse>((resolve, reject) => {
			const chunks: Buffer[] = []

			archive.on('data', chunk => {
				chunks.push(chunk)
			})

			archive.on('end', () => {
				const buffer = Buffer.concat(chunks)
				const response = new NextResponse(buffer)
				response.headers.set(
					'Content-Disposition',
					`attachment; filename="mymeet-data-${sessionId}.zip"`
				)
				response.headers.set('Content-Type', 'application/zip')
				resolve(response)
			})

			archive.on('error', error => {
				reject(error)
			})

			archive.finalize()
		})
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		)
	}
}
