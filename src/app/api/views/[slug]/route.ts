import { trackView, getViews } from '@/lib/views'
import { NextRequest, NextResponse } from 'next/server'

type Context = { params: Promise<{ slug: string }> }

export async function POST(_req: NextRequest, { params }: Context) {
	const { slug } = await params
	const views = await trackView(slug)
	return NextResponse.json({ views })
}

export async function GET(_req: NextRequest, { params }: Context) {
	const { slug } = await params
	const views = await getViews(slug)
	return NextResponse.json({ views })
}
