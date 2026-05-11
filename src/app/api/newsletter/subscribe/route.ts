import { NextRequest, NextResponse } from 'next/server'
import { addSubscriber } from '@/lib/newsletter-store'

export async function POST(request: NextRequest) {
	const { email } = await request.json()

	if (!email || typeof email !== 'string') {
		return NextResponse.json(
			{ error: 'Email non valida' },
			{ status: 400 },
		)
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

	if (!emailRegex.test(email)) {
		return NextResponse.json(
			{ error: 'Formato email non valido' },
			{ status: 400 },
		)
	}

	const result = addSubscriber(email)

	return NextResponse.json({
		success: true,
		alreadyExists: result.alreadyExists,
		subscriber: result.subscriber,
	})
}
