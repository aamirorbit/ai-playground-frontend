'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="text-center space-y-8 px-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl border border-primary/20">
              <Zap className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary/30 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Link href="/playground" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Playground
            </Button>
          </Link>
        </div>

        <div className="pt-8 text-sm text-muted-foreground">
          <p>Available pages:</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <Link href="/playground" className="text-primary hover:underline">
              Playground
            </Link>
            <span>•</span>
            <Link href="/history" className="text-primary hover:underline">
              History
            </Link>
            <span>•</span>
            <Link href="/analytics" className="text-primary hover:underline">
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

