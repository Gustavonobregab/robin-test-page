import { NextRequest, NextResponse } from 'next/server';
import steal from 'robin-wood';
import { spawn } from 'child_process';
import { writeFile, unlink, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

async function convertToPCM(inputBuffer: Buffer): Promise<Float32Array> {
  const tempInput = join(tmpdir(), `${randomUUID()}.audio`);
  const tempOutput = join(tmpdir(), `${randomUUID()}.raw`);

  try {
    await writeFile(tempInput, inputBuffer);

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', tempInput,
        '-f', 'f32le',
        '-acodec', 'pcm_f32le',
        '-ac', '1',
        '-ar', '44100',
        '-y',
        tempOutput
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg exited with code ${code}`));
      });

      ffmpeg.on('error', reject);
    });

    const rawData = await readFile(tempOutput);
    return new Float32Array(rawData.buffer, rawData.byteOffset, rawData.length / 4);
  } finally {
    await unlink(tempInput).catch(() => {});
    await unlink(tempOutput).catch(() => {});
  }
}

function float32ToWav(samples: Float32Array, sampleRate: number): Buffer {
  const buffer = Buffer.alloc(44 + samples.length * 2);

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);

  // Convert Float32 to Int16
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }

  return buffer;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const speedup = parseFloat(formData.get('speedup') as string) || 1.0;
    const volume = parseFloat(formData.get('volume') as string) || 1.0;
    const normalize = formData.get('normalize') === 'true';
    const removeSilence = formData.get('removeSilence') === 'true';
    const thresholdDb = parseFloat(formData.get('thresholdDb') as string) || -40;
    const minDurationMs = parseFloat(formData.get('minDurationMs') as string) || 100;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Convert to PCM Float32
    const pcmData = await convertToPCM(inputBuffer);
    const pcmBuffer = Buffer.from(pcmData.buffer);

    let pipeline = steal.audio(pcmBuffer);

    if (removeSilence) {
      pipeline = pipeline.removeSilence(thresholdDb, minDurationMs);
    }

    if (speedup !== 1.0) {
      pipeline = pipeline.speedup(speedup);
    }

    if (volume !== 1.0) {
      pipeline = pipeline.volume(volume);
    }

    if (normalize) {
      pipeline = pipeline.normalize();
    }

    const result = await pipeline.run();

    // Convert result back to WAV
    const resultFloat32 = new Float32Array(
      (result.data as Buffer).buffer,
      (result.data as Buffer).byteOffset,
      (result.data as Buffer).length / 4
    );
    const wavBuffer = float32ToWav(resultFloat32, result.details.sampleRate);

    const audioUint8 = new Uint8Array(wavBuffer.buffer, wavBuffer.byteOffset, wavBuffer.byteLength);

    return new Response(audioUint8 as unknown as BodyInit, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="processed.wav"',
        'X-Metrics': JSON.stringify(result.metrics),
        'X-Details': JSON.stringify(result.details),
        'X-Operations': JSON.stringify(result.operations),
      },
    });
  } catch (error) {
    console.error('Audio processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process audio' },
      { status: 500 }
    );
  }
}
