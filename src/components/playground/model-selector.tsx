'use client';

import React, { useState, useEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { Plus, X, Settings, Zap, Check, Users } from 'lucide-react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ModelCard } from '@/components/models/model-card';
import { 
  allModelsAtom,
  selectedModelsAtom,
  toggleModelAtom,
  minSelectedModelsAtom,
  maxSelectedModelsAtom,
  providersAtom,
  modelCapabilitiesAtom,
  canStartComparisonAtom
} from '@/stores/models.store';
import { useSessionManagement } from '@/hooks/use-session-management';

interface ModelSelectorProps {
  onSessionCreated?: () => void;
}

export function ModelSelector({ onSessionCreated }: ModelSelectorProps) {
  const [allModels] = useAtom(allModelsAtom);
  const [selectedModels] = useAtom(selectedModelsAtom);
  const [, toggleModel] = useAtom(toggleModelAtom);
  const [minSelected] = useAtom(minSelectedModelsAtom);
  const [maxSelected] = useAtom(maxSelectedModelsAtom);
  const [providers] = useAtom(providersAtom);
  const [capabilities] = useAtom(modelCapabilitiesAtom);
  const [canStartComparison] = useAtom(canStartComparisonAtom);
  const { isSignedIn } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string | null>(null);
  const [capabilityFilter, setCapabilityFilter] = useState<string | null>(null);
  const [waitingForAuth, setWaitingForAuth] = useState(false);
  
  const { createSession, isCreatingSession } = useSessionManagement();

  // Handle authentication success and auto-proceed with session creation
  useEffect(() => {
    if (waitingForAuth && isSignedIn && canStartComparison) {
      setWaitingForAuth(false);
      // Small delay to ensure UI state is updated
      const timer = setTimeout(async () => {
        const session = await createSession();
        if (session) {
          onSessionCreated?.();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [waitingForAuth, isSignedIn, canStartComparison, createSession, onSessionCreated]);

  const filteredModels = allModels.filter(model => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!model.name.toLowerCase().includes(query) &&
          !model.description.toLowerCase().includes(query) &&
          !model.provider.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Provider filter
    if (providerFilter && model.provider !== providerFilter) {
      return false;
    }

    // Capability filter
    if (capabilityFilter && capabilities[capabilityFilter]) {
      const modelIds = capabilities[capabilityFilter];
      if (!modelIds.includes(model.id)) {
        return false;
      }
    }

    return true;
  });

  const selectedModelDetails = selectedModels.map(id => 
    allModels.find(model => model.id === id)
  ).filter(Boolean);

  const handleStartComparison = async () => {
    if (!canStartComparison) return;
    
    // Check authentication first
    if (!isSignedIn) {
      // Set waiting state - user needs to sign in
      setWaitingForAuth(true);
      // The SignInButton will be shown in the UI
      return;
    }
    
    // User is authenticated, proceed with session creation
    const session = await createSession();
    if (session) {
      onSessionCreated?.();
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setProviderFilter(null);
    setCapabilityFilter(null);
  };

  return (
    <div className="space-y-6">
      {/* Model Selection Interface - Always Visible */}
      <div className="space-y-6">
        {/* Start Button and Selection Info */}
        <div className="flex items-center justify-between bg-gradient-to-r from-card to-card/50 p-5 rounded-2xl border-2 border-border/50 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <Badge variant="outline" className="text-sm font-semibold px-3 py-1">
                {selectedModels.length}/{maxSelected} models selected
              </Badge>
              {selectedModels.length >= minSelected ? (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Ready to compare responses
                </p>
              ) : (
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  Select at least {minSelected} models to start
                </p>
              )}
            </div>
          </div>
          <Button 
            onClick={handleStartComparison}
            disabled={!canStartComparison || isCreatingSession}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 rounded-xl px-6"
          >
            {isCreatingSession ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Start Comparison
          </Button>
        </div>

        {/* Selection Summary */}
        {selectedModels.length > 0 && (
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent shadow-glow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <span>Selected Models ({selectedModels.length})</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedModelDetails.map((model) => (
                    model && (
                      <div key={model.id} className="group flex items-center space-x-2 bg-card/80 backdrop-blur rounded-xl p-3 border-2 border-primary/20 hover:border-primary/40 transition-all duration-200 hover:shadow-md">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                          model.provider === 'OpenAI' ? 'bg-green-500' :
                          model.provider === 'Anthropic' ? 'bg-orange-500' :
                          model.provider === 'xAI' ? 'bg-purple-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-sm font-semibold">{model.name}</span>
                        <Badge variant="outline" className="text-xs font-medium">{model.provider}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                          onClick={() => toggleModel(model.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-primary/20">
                  <div className="text-sm font-medium text-muted-foreground">
                    Estimated total cost per request:
                  </div>
                  <div className="text-lg font-bold text-primary">
                    ${selectedModelDetails.reduce((acc, model) => 
                      acc + (model?.costPer1kTokens || 0), 0
                    ).toFixed(4)}/1K tokens
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search models by name, provider, or capability..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={capabilityFilter || 'all'} onValueChange={(value) => setCapabilityFilter(value === 'all' ? null : value)}>
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

          {(searchQuery || providerFilter || capabilityFilter) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Model Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </div>
    </div>
  );
}