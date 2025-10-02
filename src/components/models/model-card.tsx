'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { Check, Plus, Zap, Eye, Brain, Code, Calculator, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AIModel } from '@/types/api';
import { selectedModelsAtom, toggleModelAtom, maxSelectedModelsAtom } from '@/stores/models.store';

interface ModelCardProps {
  model: AIModel;
  className?: string;
}

const capabilityIcons = {
  text: Zap,
  vision: Eye,
  reasoning: Brain,
  coding: Code,
  mathematics: Calculator,
  'function-calling': Phone,
};

const providerColors = {
  OpenAI: 'bg-green-500',
  Anthropic: 'bg-orange-500',
  xAI: 'bg-purple-500',
};

export function ModelCard({ model, className }: ModelCardProps) {
  const [selectedModels] = useAtom(selectedModelsAtom);
  const [, toggleModel] = useAtom(toggleModelAtom);
  const [maxSelected] = useAtom(maxSelectedModelsAtom);
  
  const isSelected = selectedModels.includes(model.id);
  const canSelect = !isSelected && selectedModels.length < maxSelected;
  const isAtLimit = selectedModels.length >= maxSelected && !isSelected;

  const handleToggle = () => {
    if (isSelected || canSelect) {
      toggleModel(model.id);
    }
  };

  const formatCost = (cost: number) => {
    if (cost < 0.001) {
      return `$${(cost * 1000).toFixed(3)}/1K tokens`;
    }
    return `$${cost.toFixed(3)}/1K tokens`;
  };

  const formatContextWindow = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M tokens`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K tokens`;
    }
    return `${tokens} tokens`;
  };

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "group relative transition-all duration-300 cursor-pointer overflow-hidden",
          "hover:shadow-glow hover:-translate-y-1",
          "border-2",
          isSelected && "border-primary shadow-glow-lg bg-gradient-to-br from-primary/5 to-primary/10",
          !isSelected && "border-border/50 hover:border-primary/30",
          isAtLimit && "opacity-50 cursor-not-allowed hover:transform-none",
          className
        )}
        onClick={handleToggle}
      >
        {/* Gradient overlay on hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 transition-all duration-300",
          !isSelected && "group-hover:from-primary/5 group-hover:to-primary/10"
        )} />
        
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-lg flex items-center space-x-2">
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full shadow-md",
                    providerColors[model.provider as keyof typeof providerColors] || 'bg-gray-500'
                  )}
                />
                <span className="font-bold">{model.name}</span>
              </CardTitle>
              <Badge variant={isSelected ? "default" : "outline"} className="text-xs font-medium">
                {model.provider}
              </Badge>
            </div>
            
            <Button
              variant={isSelected ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-9 w-9 rounded-xl transition-all duration-200",
                isSelected && "shadow-lg shadow-primary/25"
              )}
              disabled={isAtLimit}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
            >
              {isSelected ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isSelected ? 'Remove model' : 'Add model'}
              </span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {model.description}
          </p>

          {/* Capabilities */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capabilities</h4>
            <div className="flex flex-wrap gap-1.5">
              {model.capabilities.map((capability) => {
                const Icon = capabilityIcons[capability as keyof typeof capabilityIcons];
                return (
                  <Tooltip key={capability}>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="secondary" 
                        className="text-xs flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                      >
                        {Icon && <Icon className="h-3 w-3" />}
                        <span className="capitalize">{capability}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="capitalize">{capability} capability</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
            <div className="space-y-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs font-medium text-muted-foreground">Context Window</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Maximum input length this model can process</p>
                </TooltipContent>
              </Tooltip>
              <div className="text-sm font-semibold text-foreground">
                {formatContextWindow(model.contextWindow)}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs font-medium text-muted-foreground">Cost</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Estimated cost per 1,000 tokens</p>
                </TooltipContent>
              </Tooltip>
              <div className="text-sm font-semibold text-foreground">
                {formatCost(model.costPer1kTokens)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}