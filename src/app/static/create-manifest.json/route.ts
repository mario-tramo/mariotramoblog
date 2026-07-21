import { NextResponse } from 'next/server'

export const dynamic = 'force-static'
export const revalidate = false

const manifest = {
	createdAt: '2026-07-21T08:44:46.000Z',
	studioVersion: '5.24.0',
	version: 3,
	workspaces: [],
}

export function GET() {
	return NextResponse.json(manifest, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
}
