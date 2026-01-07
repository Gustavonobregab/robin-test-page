'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Music,
  Upload,
  Loader2,
  Sparkles,
  Download,
  Play,
  Clock,
  Volume2,
  Gauge,
  VolumeX,
} from 'lucide-react';
import MetricsDisplay from './MetricsDisplay';

interface AudioDetails {
  duration: number;
  sampleRate: number;
  originalDuration: number;
  silenceRemoved: number;
}

interface Metrics {
  originalSize: number;
  finalSize: number;
  savedSize: number;
  ratio: number;
  percentage: number;
}

const EXAMPLE_AUDIO_URL = '/medical-audio-example.mp3';

export default function AudioProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [speedup, setSpeedup] = useState([1.0]);
  const [volume, setVolume] = useState([1.0]);
  const [normalize, setNormalize] = useState(false);
  const [removeSilence, setRemoveSilence] = useState(true);
  const [thresholdDb, setThresholdDb] = useState([-40]);
  const [minDurationMs, setMinDurationMs] = useState([100]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [details, setDetails] = useState<AudioDetails | null>(null);
  const [operations, setOperations] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setMetrics(null);
      setDetails(null);
    }
  };

  const loadExample = async () => {
    try {
      const response = await fetch(EXAMPLE_AUDIO_URL);
      const blob = await response.blob();
      const exampleFile = new File([blob], 'medical-audio-example.mp3', { type: 'audio/mpeg' });
      setFile(exampleFile);
      setOriginalUrl(EXAMPLE_AUDIO_URL);
      setResultUrl(null);
      setMetrics(null);
      setDetails(null);
    } catch (err) {
      setError('Failed to load example audio');
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select an audio file');
      return;
    }

    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('speedup', speedup[0].toString());
      formData.append('volume', volume[0].toString());
      formData.append('normalize', normalize.toString());
      formData.append('removeSilence', removeSilence.toString());
      formData.append('thresholdDb', thresholdDb[0].toString());
      formData.append('minDurationMs', minDurationMs[0].toString());

      const response = await fetch('/api/audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process audio');
      }

      const metricsHeader = response.headers.get('X-Metrics');
      const detailsHeader = response.headers.get('X-Details');
      const operationsHeader = response.headers.get('X-Operations');

      if (metricsHeader) setMetrics(JSON.parse(metricsHeader));
      if (detailsHeader) setDetails(JSON.parse(detailsHeader));
      if (operationsHeader) setOperations(JSON.parse(operationsHeader));

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = 'processed.wav';
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">Audio File</Label>
        </div>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="h-10 w-10 text-primary/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            MP3, WAV, OGG supported
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadExample}
          className="w-full h-8 text-xs"
        >
          Load Example Audio
        </Button>
        {file && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-3 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Ready</Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Processing Options */}
      <Card className="border-dashed">
        <CardContent className="pt-5 space-y-6">
          <p className="text-sm font-medium text-muted-foreground">Processing Options</p>

          {/* Speed & Volume Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Speed</Label>
                </div>
                <Badge variant="outline" className="font-mono">
                  {speedup[0].toFixed(1)}x
                </Badge>
              </div>
              <Slider
                value={speedup}
                onValueChange={setSpeedup}
                min={0.5}
                max={2.0}
                step={0.1}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Volume</Label>
                </div>
                <Badge variant="outline" className="font-mono">
                  {volume[0].toFixed(1)}x
                </Badge>
              </div>
              <Slider
                value={volume}
                onValueChange={setVolume}
                min={0.1}
                max={2.0}
                step={0.1}
                className="cursor-pointer"
              />
            </div>
          </div>

          <Separator />

          {/* Silence Removal Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Silence Removal</Label>
              </div>
              <Checkbox
                id="removeSilence"
                checked={removeSilence}
                onCheckedChange={(checked) => setRemoveSilence(checked as boolean)}
              />
            </div>

            {removeSilence && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 animate-in fade-in-50 duration-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Threshold</Label>
                    <Badge variant="outline" className="font-mono text-xs">
                      {thresholdDb[0]} dB
                    </Badge>
                  </div>
                  <Slider
                    value={thresholdDb}
                    onValueChange={setThresholdDb}
                    min={-60}
                    max={-20}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Min Duration</Label>
                    <Badge variant="outline" className="font-mono text-xs">
                      {minDurationMs[0]} ms
                    </Badge>
                  </div>
                  <Slider
                    value={minDurationMs}
                    onValueChange={setMinDurationMs}
                    min={50}
                    max={500}
                    step={10}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Normalize Option */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Normalize Audio</Label>
            </div>
            <Checkbox
              id="normalize"
              checked={normalize}
              onCheckedChange={(checked) => setNormalize(checked as boolean)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Process Button */}
      <Button
        onClick={handleProcess}
        disabled={loading || !file}
        className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Process Audio
          </>
        )}
      </Button>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {resultUrl && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          <MetricsDisplay metrics={metrics} operations={operations} />

          {details && (
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Audio Details</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-2 rounded bg-card">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold">{details.duration.toFixed(2)}s</p>
                  </div>
                  <div className="text-center p-2 rounded bg-card">
                    <p className="text-xs text-muted-foreground">Original</p>
                    <p className="font-semibold">{details.originalDuration.toFixed(2)}s</p>
                  </div>
                  <div className="text-center p-2 rounded bg-card">
                    <p className="text-xs text-muted-foreground">Silence Removed</p>
                    <p className="font-semibold text-green-600">{details.silenceRemoved.toFixed(2)}s</p>
                  </div>
                  <div className="text-center p-2 rounded bg-card">
                    <p className="text-xs text-muted-foreground">Sample Rate</p>
                    <p className="font-semibold">{details.sampleRate} Hz</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Play className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Original Audio</p>
                  </div>
                  {originalUrl && (
                    <audio controls src={originalUrl} className="w-full h-12" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Play className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Processed Audio</p>
                  </div>
                  <audio ref={audioRef} controls src={resultUrl} className="w-full h-12" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleDownload}
            variant="outline"
            className="w-full h-10"
          >
            <Download className="mr-2 h-4 w-4" />
            Download WAV
          </Button>
        </div>
      )}
    </div>
  );
}
