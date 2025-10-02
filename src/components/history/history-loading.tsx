'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryLoadingProps {
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

// Individual history item skeleton
function HistoryItemSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div 
      className="space-y-4 p-6 border rounded-lg bg-card animate-in fade-in-0 slide-in-from-bottom-3 duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header with timestamp and actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex space-x-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-6 w-3/4" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      {/* Models comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex space-x-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function HistoryLoading({ className }: HistoryLoadingProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between animate-in fade-in-0 slide-in-from-top-2 duration-700">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="animate-pulse">
            <Skeleton className="h-4 w-16" />
          </Badge>
          
          <Button variant="outline" size="icon" disabled>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats skeleton */}
      <div 
        className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg animate-in fade-in-0 slide-in-from-top-3 duration-700"
        style={{ animationDelay: '100ms' }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-16 mx-auto" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>

      {/* Filters skeleton */}
      <div 
        className="flex flex-col sm:flex-row gap-4 animate-in fade-in-0 slide-in-from-top-4 duration-700"
        style={{ animationDelay: '200ms' }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground animate-pulse" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-full sm:w-48 rounded-md" />
      </div>

      {/* Main loading indicator with pulse rings */}
      <div className="flex justify-center py-12">
        <div className="text-center space-y-6">
          <div className="relative h-16 w-16 mx-auto">
            <PulseRings />
          </div>
          <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-1000">
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      </div>

      {/* History items skeleton */}
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <HistoryItemSkeleton key={i} delay={i * 150} />
        ))}
      </div>

      {/* Loading dots animation */}
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

// Auth loading component with similar styling
export function AuthLoading({ className }: HistoryLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="text-center space-y-6">
        <div className="relative h-12 w-12 mx-auto">
          <PulseRings />
        </div>
        <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-1000">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        
        {/* Animated progress bar */}
        <div className="w-48 mx-auto">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" 
                 style={{ width: '60%', transition: 'width 2s ease-in-out' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}