import { NextResponse } from 'next/server'
import { scrapeMyMeetAI } from '@/server/scrapper'

export async function GET() {
	try {
		const result = await scrapeMyMeetAI()
		return NextResponse.json({
			success: true,
			data: {
				success: result.success,
				imageUrls: result.imageUrls,
				downloadedImages: result.downloadedImages,
				errors: result.errors,
				textFile: result.textFile,
				sessionId: result.sessionId,
			},
		})
	} catch (error) {
		console.error('Scrape API Error:', error)
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			},
			{ status: 500 }
		)
	}
}
