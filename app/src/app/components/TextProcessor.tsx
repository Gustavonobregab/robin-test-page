'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import MetricsDisplay from './MetricsDisplay';

interface TextResult {
  data: string;
  metrics: {
    originalSize: number;
    finalSize: number;
    savedSize: number;
    ratio: number;
    percentage: number;
  };
  operations: string[];
}

const EXAMPLE_TEXT = `


    This    is   an   example     of    poorly      formatted    text.


It has    way     too    many      spaces,


    unnecessary     line    breaks,



and      inconsistent       formatting      throughout.



    The     LLM     will    charge     you    for    all    these     extra     tokens!



        Save    money    by     compressing     this     text    first.



`;

export default function TextProcessor() {
  const [input, setInput] = useState('');
  const [trim, setTrim] = useState(true);
  const [minify, setMinify] = useState(true);
  const [compression, setCompression] = useState<'none' | 'gzip' | 'brotli'>('none');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TextResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleProcess = async () => {
    if (!input.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, trim, minify, compression }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process text');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.data && typeof result.data === 'string') {
      await navigator.clipboard.writeText(result.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <Label htmlFor="text-input" className="text-sm font-medium">
            Input Text
          </Label>
        </div>
        <Textarea
          id="text-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[160px] resize-none font-mono text-sm transition-all focus:ring-2 focus:ring-primary/20"
          placeholder="Paste your text here to compress..."
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {input.length} characters
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInput(EXAMPLE_TEXT)}
            className="h-7 text-xs"
          >
            Load Example
          </Button>
        </div>
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-4">
          <p className="text-sm font-medium mb-4 text-muted-foreground">Processing Options</p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="trim"
                checked={trim}
                onCheckedChange={(checked) => setTrim(checked as boolean)}
              />
              <Label
                htmlFor="trim"
                className="text-sm font-normal cursor-pointer"
              >
                Trim Whitespace
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="minify"
                checked={minify}
                onCheckedChange={(checked) => setMinify(checked as boolean)}
              />
              <Label
                htmlFor="minify"
                className="text-sm font-normal cursor-pointer"
              >
                Minify
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Label className="text-sm font-normal">Compression:</Label>
              <Select value={compression} onValueChange={(v) => setCompression(v as 'none' | 'gzip' | 'brotli')}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="gzip">gzip</SelectItem>
                  <SelectItem value="brotli">brotli</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleProcess}
        disabled={loading || !input.trim()}
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
            Process Text
          </>
        )}
      </Button>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          <MetricsDisplay metrics={result.metrics} operations={result.operations} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Processed Output</Label>
              </div>
              {typeof result.data === 'string' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-foreground/80 max-h-[200px] overflow-auto">
                  {typeof result.data === 'string' ? result.data : '[Binary compressed data]'}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
