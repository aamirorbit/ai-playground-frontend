'use client';

import React from 'react';
import { Monitor, Smartphone, Zap, ArrowRight, Coffee, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileRestrictionProps {
  className?: string;
}

export function MobileRestriction({ className }: MobileRestrictionProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5", className)}>
      <Card className="w-full max-w-md mx-auto shadow-2xl border-2 border-primary/20">
        <CardContent className="p-8 text-center space-y-6">
          {/* Animated Icons */}
          <div className="relative">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="relative">
                <Smartphone className="h-12 w-12 text-muted-foreground animate-bounce" />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✗</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-1">
                <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">VS</span>
                <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
              </div>
              
              <div className="relative">
                <Monitor className="h-12 w-12 text-green-500 animate-pulse" />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fun Badge */}
          <Badge variant="outline" className="text-lg py-2 px-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/30 dark:to-red-950/30 border-orange-300 dark:border-orange-700">
            <Zap className="h-4 w-4 mr-2 text-orange-500" />
            AI Comparison Arena
          </Badge>

          {/* Main Message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              Oops! 📱⚔️💥
            </h1>
            <p className="text-lg font-semibold text-primary">
              AI Comparisons Can't Happen on Mobile!
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Our AI models need more screen real estate to properly duke it out! 
              </p>
              <p>
                Think of it like trying to fit a <strong>robot comparison contest</strong> in a phone booth... 
                it just doesn't work! 🤖📊
              </p>
            </div>
          </div>

          {/* Funny Reasons */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
            <h3 className="font-semibold text-sm text-foreground mb-2">Why Desktop Only? 🤔</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Cpu className="h-3 w-3 text-blue-500" />
                <span>AI models need room to think (and flex) 💪</span>
              </div>
              <div className="flex items-center space-x-2">
                <Monitor className="h-3 w-3 text-green-500" />
                <span>Side-by-side comparisons require wide screens 📊</span>
              </div>
              <div className="flex items-center space-x-2">
                <Coffee className="h-3 w-3 text-amber-500" />
                <span>Desktop = serious AI business time ☕</span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-foreground mb-2">
                🖥️ Switch to Desktop for the Full Experience!
              </p>
              <p className="text-xs text-muted-foreground">
                Fire up your laptop or desktop computer and watch AI models compare responses in glorious wide-screen!
              </p>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'AI Model Playground',
                    text: 'Check out this amazing AI comparison arena!',
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
            >
              <span>📱 Share Link to Desktop</span>
            </Button>
          </div>

          {/* Fun Footer */}
          <div className="pt-4 border-t border-muted">
            <p className="text-xs text-muted-foreground italic">
              "Great AI comparisons require great screens!" - Ancient Programmer Proverb 📜
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}