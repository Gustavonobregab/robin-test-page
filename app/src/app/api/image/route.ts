import { NextRequest, NextResponse } from 'next/server';
import steal from 'robin-wood';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const width = parseInt(formData.get('width') as string) || 0;
    const height = parseInt(formData.get('height') as string) || 0;
    const quality = parseInt(formData.get('quality') as string) || 85;
    const format = (formData.get('format') as string) || 'jpg';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    let pipeline = steal.image(inputBuffer);

    if (width > 0 && height > 0) {
      pipeline = pipeline.resize(width, height);
    }

    if (quality !== 100) {
      pipeline = pipeline.quality(quality);
    }

    if (format && ['jpg', 'png', 'webp'].includes(format)) {
      pipeline = pipeline.format(format as 'jpg' | 'png' | 'webp');
    }

    const result = await pipeline.run();

    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };

    return new NextResponse(result.data as Buffer, {
      headers: {
        'Content-Type': mimeTypes[format] || 'image/jpeg',
        'Content-Disposition': `attachment; filename="processed.${format}"`,
        'X-Metrics': JSON.stringify(result.metrics),
        'X-Details': JSON.stringify(result.details),
        'X-Operations': JSON.stringify(result.operations),
      },
    });
  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    );
  }
}
