'use client';

import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { 
  Search, 
  Filter, 
  Calendar, 
  Trash2, 
  Download,
  MoreVertical,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HistoryItem } from './history-item';
import {
  filteredHistoryAtom,
  historySearchQueryAtom,
  historyProviderFilterAtom,
  historyStatsAtom
} from '@/stores/history.store';

export function HistoryList() {
  const [filteredHistory] = useAtom(filteredHistoryAtom);
  const [searchQuery, setSearchQuery] = useAtom(historySearchQueryAtom);
  const [providerFilter, setProviderFilter] = useAtom(historyProviderFilterAtom);

  const [historyStats] = useAtom(historyStatsAtom);

  const hasFilters = searchQuery || providerFilter;

  const clearFilters = () => {
    setSearchQuery('');
    setProviderFilter(null);
  };



  const handleExportHistory = () => {
    const data = {
      exportDate: new Date().toISOString(),
      totalItems: filteredHistory.length,
      stats: historyStats,
      items: filteredHistory
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-playground-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const providers = ['openai', 'anthropic', 'xai'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Comparison History</h1>
          <p className="text-muted-foreground">
            View and manage your past AI model comparisons
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {filteredHistory.length} comparison{filteredHistory.length !== 1 ? 's' : ''}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportHistory}>
                <Download className="mr-2 h-4 w-4" />
                Export History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold">{historyStats.totalComparisons}</div>
          <div className="text-xs text-muted-foreground">Total Comparisons</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold">{historyStats.totalTokensUsed.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Tokens</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">${historyStats.totalCost.toFixed(4)}</div>
          <div className="text-xs text-muted-foreground">Total Cost</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search history by prompt or response..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={providerFilter || 'all'} onValueChange={(value) => setProviderFilter(value === 'all' ? null : value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Providers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                <span className="capitalize">{provider}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>



        {hasFilters && (
          <Button variant="outline" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary">
              Search: "{searchQuery}"
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {providerFilter && (
            <Badge variant="secondary">
              Provider: {providerFilter}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => setProviderFilter(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

        </div>
      )}

      <Separator />

      {/* History Items */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {hasFilters ? 'No matching comparisons' : 'No history yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasFilters 
                ? 'Try adjusting your search or filter criteria'
                : 'Start comparing AI models to build your history'
              }
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}