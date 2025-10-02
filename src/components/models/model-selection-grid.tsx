'use client';

import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { Search, Filter, X, Users, Zap } from 'lucide-react';
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
import { ModelCard } from './model-card';
import {
  filteredModelsAtom,
  selectedCapabilityFilterAtom,
  selectedProviderFilterAtom,
  searchQueryAtom,
  selectedModelsAtom,
  clearSelectedModelsAtom,
  minSelectedModelsAtom,
  maxSelectedModelsAtom,
  providersAtom,
  modelCapabilitiesAtom,
  canStartComparisonAtom
} from '@/stores/models.store';

export function ModelSelectionGrid() {
  const [filteredModels] = useAtom(filteredModelsAtom);
  const [selectedModels] = useAtom(selectedModelsAtom);
  const [, clearSelectedModels] = useAtom(clearSelectedModelsAtom);
  const [minSelected] = useAtom(minSelectedModelsAtom);
  const [maxSelected] = useAtom(maxSelectedModelsAtom);
  const [providers] = useAtom(providersAtom);
  const [capabilities] = useAtom(modelCapabilitiesAtom);
  const [canStartComparison] = useAtom(canStartComparisonAtom);
  
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [selectedProvider, setSelectedProvider] = useAtom(selectedProviderFilterAtom);
  const [selectedCapability, setSelectedCapability] = useAtom(selectedCapabilityFilterAtom);

  const hasFilters = searchQuery || selectedProvider || selectedCapability;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedProvider(null);
    setSelectedCapability(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Select AI Models</h1>
          <p className="text-muted-foreground">
            Choose {minSelected}-{maxSelected} models to compare their responses
          </p>
        </div>
        
        {selectedModels.length > 0 && (
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              <Users className="w-4 h-4 mr-1" />
              {selectedModels.length}/{maxSelected} selected
            </Badge>
            <Button variant="outline" size="sm" onClick={clearSelectedModels}>
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search models by name, provider, or capability..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedProvider || 'all'} onValueChange={(value) => setSelectedProvider(value === 'all' ? null : value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Providers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCapability || 'all'} onValueChange={(value) => setSelectedCapability(value === 'all' ? null : value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Capabilities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Capabilities</SelectItem>
            {Object.keys(capabilities).map((capability) => (
              <SelectItem key={capability} value={capability}>
                <span className="capitalize">{capability}</span>
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
          {selectedProvider && (
            <Badge variant="secondary">
              Provider: {selectedProvider}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => setSelectedProvider(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedCapability && (
            <Badge variant="secondary">
              Capability: {selectedCapability}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => setSelectedCapability(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      <Separator />

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>

      {/* Empty State */}
      {filteredModels.length === 0 && (
        <div className="text-center py-12">
          <Zap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No models found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Selection Summary */}
      {selectedModels.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5" />
            <span className="font-medium">
              {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
            </span>
            <Button 
              variant="secondary" 
              size="sm"
              disabled={!canStartComparison}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 disabled:opacity-50"
            >
              {selectedModels.length < minSelected 
                ? `Select ${minSelected - selectedModels.length} more` 
                : 'Start Comparison'
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}