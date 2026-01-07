'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingDown, Zap, FileDown } from 'lucide-react';

interface Metrics {
  originalSize: number;
  finalSize: number;
  savedSize: number;
  ratio: number;
  percentage: number;
}

interface MetricsDisplayProps {
  metrics: Metrics | null;
  operations?: string[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function MetricsDisplay({ metrics, operations }: MetricsDisplayProps) {
  if (!metrics) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/10 border-primary/20 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Compression Results</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-card shadow-sm border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileDown className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Original</p>
            </div>
            <p className="text-lg font-bold text-foreground">{formatBytes(metrics.originalSize)}</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-card shadow-sm border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Final</p>
            </div>
            <p className="text-lg font-bold text-green-600">{formatBytes(metrics.finalSize)}</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-card shadow-sm border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Ratio</p>
            </div>
            <p className="text-lg font-bold text-primary">{metrics.ratio.toFixed(2)}x</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-card shadow-sm border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Saved</p>
            </div>
            <p className="text-lg font-bold text-purple-600">{metrics.percentage.toFixed(1)}%</p>
          </div>
        </div>

        {operations && operations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Operations Applied:</p>
            <div className="flex flex-wrap gap-2">
              {operations.map((op, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {op}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
