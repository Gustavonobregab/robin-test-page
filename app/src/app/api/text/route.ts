import { NextRequest, NextResponse } from 'next/server';
import steal from 'robin-wood';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, trim, minify, compression } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    let pipeline = steal.text(text);

    if (trim) {
      pipeline = pipeline.trim();
    }

    if (minify) {
      pipeline = pipeline.minify();
    }

    if (compression && compression !== 'none') {
      pipeline = pipeline.compress(compression as 'gzip' | 'brotli');
    }

    const result = await pipeline.run();

    return NextResponse.json({
      success: true,
      data: result.data,
      metrics: result.metrics,
      details: result.details,
      operations: result.operations,
    });
  } catch (error) {
    console.error('Text processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process text' },
      { status: 500 }
    );
  }
}
