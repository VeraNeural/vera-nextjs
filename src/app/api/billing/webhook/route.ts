import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const payload = { error: 'legacy_webhook_removed' };

export async function POST() {
	return NextResponse.json(payload, { status: 410 });
}

export async function GET() {
	return NextResponse.json(payload, { status: 410 });
}