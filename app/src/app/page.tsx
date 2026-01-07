'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Music, ImageIcon, Github } from 'lucide-react';
import TextProcessor from './components/TextProcessor';
import AudioProcessor from './components/AudioProcessor';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-5xl mx-auto py-12 px-4">
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-4 text-center">
            Robin Wood
          </h1>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto">
            Compress audio, text, and images before sending to LLM APIs.
            <span className="text-primary font-medium"> Save money. Keep the signal.</span>
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Badge variant="secondary" className="px-3 py-1">
              <FileText className="h-3 w-3 mr-1" />
              Text
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Music className="h-3 w-3 mr-1" />
              Audio
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <ImageIcon className="h-3 w-3 mr-1" />
              Image
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="shadow-xl shadow-primary/5 border-primary/10">
          <Tabs defaultValue="text" className="w-full">
            <CardHeader className="pb-0">
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="text" className="data-[state=active]:shadow-sm gap-2 h-10">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Text</span>
                </TabsTrigger>
                <TabsTrigger value="audio" className="data-[state=active]:shadow-sm gap-2 h-10">
                  <Music className="h-4 w-4" />
                  <span className="hidden sm:inline">Audio</span>
                </TabsTrigger>
                <TabsTrigger value="image" className="data-[state=active]:shadow-sm gap-2 h-10">
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Image</span>
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="text" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                <TextProcessor />
              </TabsContent>

              <TabsContent value="audio" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                <AudioProcessor />
              </TabsContent>

              <TabsContent value="image" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Image Processing
                  </h3>
                  <p className="text-sm text-muted-foreground/70">
                    Coming soon...
                  </p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <footer className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <a
              href="https://www.npmjs.com/package/robin-wood"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              robin-wood
            </a>
          </div>
          <a
            href="https://github.com/gustavonobg/robin-wood"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </footer>
      </div>
    </main>
  );
}
