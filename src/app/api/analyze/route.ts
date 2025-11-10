import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Parse multipart form data
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  // Placeholder: Just return file info for now
  return NextResponse.json({
    message: 'File received for analysis.',
    name: file.name,
    type: file.type,
    size: file.size,
  });
}
