'use client';

import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { BarChart3, TrendingUp, DollarSign, Clock, Users, Zap, Lock, Loader2, Activity, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { historyStatsAtom } from '@/stores/history.store';
import { modelStatsAtom, getModelByIdAtom } from '@/stores/models.store';
import { useModelData } from '@/hooks/use-model-data';
import { useHistoryData } from '@/hooks/use-history-data';

export function AnalyticsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [historyStats] = useAtom(historyStatsAtom);
  const [modelStats] = useAtom(modelStatsAtom);
  const [getModelById] = useAtom(getModelByIdAtom);
  const { hasModels, hasFetchedModels, fetchModelDataSilently } = useModelData();
  const { hasHistory, hasFetchedHistory } = useHistoryData();

  useEffect(() => {
    // Only fetch data sources that haven't been fetched before
    if (!hasFetchedModels) {
      fetchModelDataSilently();
    }
    
    // Note: History will be fetched automatically by the useHistoryData hook 
    // when user is authenticated, no need to fetch it here
  }, [hasFetchedModels, fetchModelDataSilently]);

  // Wait for auth initialization before showing any auth-related UI
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Loading Analytics...</h3>
            <p className="text-muted-foreground text-sm">
              Checking authentication status
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authentication check (only after initialization)
  if (!isSignedIn) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <Lock className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-3">Authentication Required</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
          Sign in to view your usage analytics and performance insights for AI model comparisons.
        </p>
        <SignInButton mode="modal">
          <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 rounded-xl font-semibold">
            <Lock className="w-4 h-4 mr-2" />
            Sign In to View Analytics
          </Button>
        </SignInButton>
      </div>
    );
  }

  const topModels = Object.entries(historyStats.modelUsageCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topProviders = Object.entries(historyStats.providerUsageCount)
    .sort(([, a], [, b]) => b - a);

  // Helper function to get full model name
  const getModelName = (modelId: string) => {
    const model = getModelById(modelId);
    return model ? model.name : modelId;
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl blur-3xl" />
        <div className="relative space-y-3 pb-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Insights into your AI model usage and performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats - Enhanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative border-2 border-border/50 rounded-2xl overflow-hidden shadow-md hover:shadow-glow transition-all duration-200 hover:-translate-y-1 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Comparisons</CardTitle>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Activity className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{historyStats.totalComparisons}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              All time history
            </p>
          </CardContent>
        </Card>

        <Card className="relative border-2 border-border/50 rounded-2xl overflow-hidden shadow-md hover:shadow-glow transition-all duration-200 hover:-translate-y-1 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Cost</CardTitle>
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-4.5 w-4.5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${historyStats.totalCost.toFixed(4)}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Avg: ${historyStats.totalComparisons > 0 ? (historyStats.totalCost / historyStats.totalComparisons).toFixed(6) : '0.000000'} per comparison
            </p>
          </CardContent>
        </Card>

        <Card className="relative border-2 border-border/50 rounded-2xl overflow-hidden shadow-md hover:shadow-glow transition-all duration-200 hover:-translate-y-1 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Tokens</CardTitle>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Zap className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{historyStats.totalTokensUsed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Avg: {historyStats.totalComparisons > 0 ? Math.round(historyStats.totalTokensUsed / historyStats.totalComparisons).toLocaleString() : '0'} per comparison
            </p>
          </CardContent>
        </Card>

        <Card className="relative border-2 border-border/50 rounded-2xl overflow-hidden shadow-md hover:shadow-glow transition-all duration-200 hover:-translate-y-1 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Avg Response Time</CardTitle>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Clock className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {(historyStats.averageResponseTime / 1000).toFixed(1)}s
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Across all models
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Model Stats - Enhanced Cards */}
      {modelStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2 border-border/50 rounded-2xl shadow-md">
            <CardHeader className="bg-gradient-to-r from-card to-card/50 border-b-2 border-border/30">
              <CardTitle className="flex items-center space-x-2.5 text-xl">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold">Available Models</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/30">
                <span className="text-sm font-semibold">Total Models</span>
                <Badge className="text-sm font-bold px-3 py-1">{modelStats.totalModels}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/30">
                <span className="text-sm font-semibold">Providers</span>
                <Badge variant="secondary" className="text-sm font-bold px-3 py-1">{modelStats.totalProviders}</Badge>
              </div>
              <div className="space-y-2 p-3 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/30 dark:border-green-800/30">
                <span className="text-sm font-bold text-green-900 dark:text-green-100">Cost Range</span>
                <div className="text-xs font-medium text-green-700 dark:text-green-300">
                  ${modelStats.costRange.min.toFixed(6)} - ${modelStats.costRange.max.toFixed(6)} per 1K tokens
                </div>
              </div>
              <div className="space-y-2 p-3 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">Context Window Range</span>
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {(modelStats.contextWindowRange.min / 1000).toFixed(0)}K - {(modelStats.contextWindowRange.max / 1000).toFixed(0)}K tokens
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/50 rounded-2xl shadow-md">
            <CardHeader className="bg-gradient-to-r from-card to-card/50 border-b-2 border-border/30">
              <CardTitle className="flex items-center space-x-2.5 text-xl">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold">Provider Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {modelStats.byProvider.map((provider, index) => {
                const percentage = (provider.modelCount / modelStats.totalModels) * 100;
                const colors = [
                  'from-blue-500 to-indigo-500',
                  'from-green-500 to-emerald-500',
                  'from-purple-500 to-pink-500',
                  'from-amber-500 to-orange-500'
                ];
                return (
                  <div key={provider.provider} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{provider.provider}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {provider.modelCount} models
                        </span>
                        <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                          ${provider.avgCost.toFixed(4)}
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={percentage} className="h-2.5 bg-muted" />
                      <div className={cn("absolute inset-0 h-2.5 rounded-full opacity-20 bg-gradient-to-r", colors[index % colors.length])} style={{width: `${percentage}%`}} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Analytics - Enhanced Cards */}
      {historyStats.totalComparisons > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2 border-border/50 rounded-2xl shadow-md">
            <CardHeader className="bg-gradient-to-r from-card to-card/50 border-b-2 border-border/30">
              <CardTitle className="flex items-center space-x-2.5 text-xl">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold">Most Used Models</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {topModels.length > 0 ? (
                topModels.map(([model, count], index) => {
                  const percentage = (count / historyStats.totalComparisons) * 100;
                  const modelName = getModelName(model);
                  const colors = [
                    'from-blue-500 to-indigo-500',
                    'from-green-500 to-emerald-500',
                    'from-purple-500 to-pink-500',
                    'from-amber-500 to-orange-500',
                    'from-red-500 to-rose-500'
                  ];
                  return (
                    <div key={model} className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className={cn("w-1.5 h-8 rounded-full bg-gradient-to-b", colors[index % colors.length])} />
                          <span className="text-sm font-bold">{modelName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            {count} uses
                          </span>
                          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="relative">
                        <Progress value={percentage} className="h-2.5 bg-muted" />
                        <div className={cn("absolute inset-0 h-2.5 rounded-full opacity-20 bg-gradient-to-r", colors[index % colors.length])} style={{width: `${percentage}%`}} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm font-medium text-muted-foreground text-center py-8">No usage data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-border/50 rounded-2xl shadow-md">
            <CardHeader className="bg-gradient-to-r from-card to-card/50 border-b-2 border-border/30">
              <CardTitle className="flex items-center space-x-2.5 text-xl">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold">Provider Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {topProviders.length > 0 ? (
                topProviders.map(([provider, count], index) => {
                  const totalUsage = Object.values(historyStats.providerUsageCount).reduce((a, b) => a + b, 0);
                  const percentage = (count / totalUsage) * 100;
                  const colors = [
                    'from-blue-500 to-indigo-500',
                    'from-green-500 to-emerald-500',
                    'from-purple-500 to-pink-500'
                  ];
                  return (
                    <div key={provider} className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className={cn("w-1.5 h-8 rounded-full bg-gradient-to-b", colors[index % colors.length])} />
                          <span className="text-sm font-bold capitalize">{provider}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            {count} uses
                          </span>
                          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="relative">
                        <Progress value={percentage} className="h-2.5 bg-muted" />
                        <div className={cn("absolute inset-0 h-2.5 rounded-full opacity-20 bg-gradient-to-r", colors[index % colors.length])} style={{width: `${percentage}%`}} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm font-medium text-muted-foreground text-center py-8">No usage data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State - Enhanced */}
      {historyStats.totalComparisons === 0 && (
        <Card className="border-2 border-border/50 rounded-2xl shadow-md">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BarChart3 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No Analytics Data Yet</h3>
            <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
              Start comparing AI models to see analytics and insights about your usage
            </p>
            <Button 
              onClick={() => window.location.href = '/playground'}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 rounded-xl font-semibold"
            >
              <Zap className="w-4 h-4 mr-2" />
              Go to Playground
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}