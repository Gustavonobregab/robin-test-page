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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ImageIcon,
  Upload,
  Loader2,
  Sparkles,
  Download,
  Maximize2,
  Link2,
  Palette,
} from 'lucide-react';
import MetricsDisplay from './MetricsDisplay';

interface ImageDetails {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  format: string;
}

interface Metrics {
  originalSize: number;
  finalSize: number;
  savedSize: number;
  ratio: number;
  percentage: number;
}

export default function ImageProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [quality, setQuality] = useState([85]);
  const [format, setFormat] = useState<'jpg' | 'png' | 'webp'>('jpg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [details, setDetails] = useState<ImageDetails | null>(null);
  const [operations, setOperations] = useState<string[]>([]);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResultUrl(null);
      setMetrics(null);
      setDetails(null);

      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = url;
    }
  };

  const handleWidthChange = (value: string) => {
    const newWidth = parseInt(value) || 0;
    setWidth(newWidth);
    if (maintainRatio && originalDimensions && newWidth > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (value: string) => {
    const newHeight = parseInt(value) || 0;
    setHeight(newHeight);
    if (maintainRatio && originalDimensions && newHeight > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('width', width.toString());
      formData.append('height', height.toString());
      formData.append('quality', quality[0].toString());
      formData.append('format', format);

      const response = await fetch('/api/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
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
      a.download = `processed.${format}`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">Image File</Label>
        </div>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="h-10 w-10 text-primary/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WebP supported
          </p>
        </div>

        {previewUrl && (
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Original Preview</p>
                {originalDimensions && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {originalDimensions.width} x {originalDimensions.height}
                  </Badge>
                )}
              </div>
              <div className="relative rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto max-h-48 object-contain"
                />
              </div>
              {file && (
                <p className="text-xs text-muted-foreground mt-2">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Processing Options */}
      <Card className="border-dashed">
        <CardContent className="pt-5 space-y-6">
          <p className="text-sm font-medium text-muted-foreground">Processing Options</p>

          {/* Dimensions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Dimensions</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Width (px)</Label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Height (px)</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="maintainRatio"
                checked={maintainRatio}
                onCheckedChange={(checked) => setMaintainRatio(checked as boolean)}
              />
              <Label
                htmlFor="maintainRatio"
                className="text-sm font-normal cursor-pointer flex items-center gap-1"
              >
                <Link2 className="h-3 w-3" />
                Maintain Aspect Ratio
              </Label>
            </div>
          </div>

          <Separator />

          {/* Quality Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Quality</Label>
              </div>
              <Badge variant="outline" className="font-mono">
                {quality[0]}%
              </Badge>
            </div>
            <Slider
              value={quality}
              onValueChange={setQuality}
              min={1}
              max={100}
              step={1}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Lower quality = smaller file size. Recommended: 75-85%
            </p>
          </div>

          <Separator />

          {/* Format Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm">Output Format</Label>
            </div>
            <Select value={format} onValueChange={(v) => setFormat(v as 'jpg' | 'png' | 'webp')}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpg">JPEG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
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
            Process Image
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
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Image Details</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-2 rounded bg-card">
                    <p className="text-xs text-muted-foreground">Original</p>
                    <p className="font-semibold text-sm">{details.originalWidth} x {details.originalHeight}</p>
                  </div>
                  <div className="text-center p-2 rounded bg-card">
                    <p className="text-xs text-muted-foreground">New Size</p>
                    <p className="font-semibold text-sm text-green-600">{details.width} x {details.height}</p>
                  </div>
                  <div className="text-center p-2 rounded bg-card">
                    <p className="text-xs text-muted-foreground">Format</p>
                    <p className="font-semibold text-sm uppercase">{details.format}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison View */}
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-3">Before / After</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">Original</Badge>
                  <div className="rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center aspect-video">
                    {previewUrl && (
                      <img src={previewUrl} alt="Original" className="max-w-full h-auto max-h-48 object-contain" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Badge className="text-xs">Processed</Badge>
                  <div className="rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center aspect-video">
                    <img src={resultUrl} alt="Processed" className="max-w-full h-auto max-h-48 object-contain" />
                  </div>
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
            Download {format.toUpperCase()}
          </Button>
        </div>
      )}
    </div>
  );
}
