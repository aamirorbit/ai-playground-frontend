'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LayoutGrid, FileText, BarChart3, Search, Filter, RotateCcw, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaygroundLoadingProps {
  className?: string;
}

// Animated pulse rings for the main loading indicator
function PulseRings() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping animation-delay-0"></div>
      <div className="absolute inset-0 rounded-full bg-primary/15 animate-ping animation-delay-300"></div>
      <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping animation-delay-600"></div>
      <div className="relative h-16 w-16 rounded-full bg-primary/25 animate-pulse"></div>
    </div>
  );
}

// Model card skeleton for the selector
function ModelCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <Card 
      className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-5 w-16 rounded-full" />
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

// Response area skeleton for the interface
function ResponseAreaSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <Card 
      className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Response content skeleton */}
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton 
              key={i} 
              className={cn(
                "h-4",
                i === 0 ? "w-full" : 
                i === 1 ? "w-5/6" : 
                i === 2 ? "w-4/5" : 
                i === 3 ? "w-full" : "w-2/3"
              )} 
            />
          ))}
        </div>
        
        {/* Performance metrics skeleton */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-6 w-12 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple model loading state
export function ModelLoading({ className }: PlaygroundLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="text-center space-y-6">
        <div className="relative h-12 w-12 mx-auto">
          <PulseRings />
        </div>
        <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-1000">
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        
        {/* Animated progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" 
                 style={{ width: '70%', transition: 'width 2s ease-in-out' }}></div>
          </div>
        </div>
        
        {/* Loading dots animation */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Model selector skeleton
export function ModelSelectorLoading({ className }: PlaygroundLoadingProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-700">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Selected models summary */}
      <div 
        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg animate-in fade-in-0 slide-in-from-top-3 duration-700"
        style={{ animationDelay: '100ms' }}
      >
        <div className="flex items-center space-x-3">
          <Skeleton className="h-5 w-32" />
          <div className="flex space-x-2">
            {[0, 1].map((i) => (
              <Badge key={i} variant="secondary" className="animate-pulse">
                <Skeleton className="h-4 w-20" />
              </Badge>
            ))}
          </div>
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Filters */}
      <div 
        className="flex flex-col sm:flex-row gap-4 animate-in fade-in-0 slide-in-from-top-4 duration-700"
        style={{ animationDelay: '200ms' }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground animate-pulse" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Model grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ModelCardSkeleton key={i} delay={i * 100} />
        ))}
      </div>

      {/* Loading indicator */}
      <div className="flex justify-center py-8">
        <div className="text-center space-y-4">
          <div className="relative h-8 w-8 mx-auto">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-primary/40 animate-ping"></div>
          </div>
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Playground interface skeleton
export function PlaygroundInterfaceLoading({ className }: PlaygroundLoadingProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-700">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Control bar */}
      <div 
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl border-2 border-primary/20 shadow-lg animate-in fade-in-0 slide-in-from-top-3 duration-700"
        style={{ animationDelay: '100ms' }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-6">
            {/* View mode controls */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-muted-foreground">View:</span>
              <div className="flex items-center border rounded-lg p-1 bg-background/50">
                {[LayoutGrid, FileText].map((Icon, i) => (
                  <Button key={i} variant="ghost" size="sm" className="h-8 px-3 text-xs" disabled>
                    <Icon className="h-3 w-3 mr-1" />
                    <Skeleton className="h-3 w-12" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Metrics toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-muted-foreground">Metrics:</span>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs" disabled>
                <BarChart3 className="h-3 w-3 mr-1" />
                <Skeleton className="h-3 w-6" />
              </Button>
            </div>
          </div>

          <Button variant="outline" size="sm" disabled className="flex items-center space-x-2">
            <RotateCcw className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div 
        className="w-full min-h-[70vh] flex flex-col justify-center space-y-12 animate-in fade-in-0 slide-in-from-bottom-2 duration-700"
        style={{ animationDelay: '200ms' }}
      >
        {/* AI Battle Animation Section */}
        <div className="w-full space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative h-16 w-16 mx-auto">
              <PulseRings />
            </div>
            <div className="text-center space-y-2">
              <Skeleton className="h-7 w-64 mx-auto" />
              <Skeleton className="h-5 w-48 mx-auto" />
            </div>
          </div>

          {/* Prompt suggestions skeleton */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 mx-auto" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className="p-3 bg-muted/50 border border-muted rounded-lg animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-4 w-72 mx-auto" />
            </div>
          </div>
        </div>

        {/* Prompt input skeleton */}
        <div className="w-full space-y-3">
          <div className="relative">
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="absolute bottom-3 right-3">
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Complete playground loading with response areas
export function PlaygroundWithResponsesLoading({ className }: PlaygroundLoadingProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-700">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Control bar */}
      <div 
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl border-2 border-primary/20 shadow-lg animate-in fade-in-0 slide-in-from-top-3 duration-700"
        style={{ animationDelay: '100ms' }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-muted-foreground">View:</span>
              <div className="flex items-center border rounded-lg p-1 bg-background/50">
                <Button variant="default" size="sm" className="h-8 px-3 text-xs" disabled>
                  <LayoutGrid className="h-3 w-3 mr-1" />
                  <span>Side by Side</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-muted-foreground">Metrics:</span>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs" disabled>
                <BarChart3 className="h-3 w-3 mr-1" />
                <span>On</span>
              </Button>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>
            <RotateCcw className="h-4 w-4 mr-2" />
            <span>New Comparison</span>
          </Button>
        </div>
      </div>

      {/* Response areas */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-700"
        style={{ animationDelay: '200ms' }}
      >
        {[0, 1, 2].map((i) => (
          <ResponseAreaSkeleton key={i} delay={i * 150} />
        ))}
      </div>

      {/* Comparison view skeleton */}
      <div 
        className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-3 duration-700"
        style={{ animationDelay: '400ms' }}
      >
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          {[0, 1, 2].map((i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton className="h-8 w-16 mx-auto" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Prompt input skeleton */}
      <div 
        className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
        style={{ animationDelay: '500ms' }}
      >
        <div className="relative">
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="absolute bottom-3 right-3">
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>
      </div>

      {/* Loading dots at bottom */}
      <div className="flex justify-center py-8">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}