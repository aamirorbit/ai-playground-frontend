'use client';

import React, { useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { Send, Loader2, History, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  currentPromptAtom, 
  isSubmittingPromptAtom,
  promptHistoryAtom,
  addPromptToHistoryAtom
} from '@/stores/ui.store';
import { sessionModelsAtom } from '@/stores/session.store';
import { getModelByIdAtom } from '@/stores/models.store';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

const promptSuggestions = [
  "Explain quantum computing in simple terms",
  "Write a Python function to find prime numbers",
  "Compare the benefits of React vs Vue.js",
  "Describe the impact of AI on future jobs",
  "Create a haiku about artificial intelligence",
  "Explain the difference between machine learning and deep learning",
  "Write a short story about time travel",
  "Compare different sorting algorithms",
];

export function PromptInput({ onSubmit, disabled = false }: PromptInputProps) {
  const [currentPrompt, setCurrentPrompt] = useAtom(currentPromptAtom);
  const [isSubmitting] = useAtom(isSubmittingPromptAtom);
  const [promptHistory] = useAtom(promptHistoryAtom);
  const [, addPromptToHistory] = useAtom(addPromptToHistoryAtom);
  const [sessionModels] = useAtom(sessionModelsAtom);
  const [getModelById] = useAtom(getModelByIdAtom);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!currentPrompt.trim() || isSubmitting || disabled) return;
    
    const prompt = currentPrompt.trim();
    addPromptToHistory(prompt);
    onSubmit(prompt);
    setCurrentPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertPrompt = (prompt: string) => {
    setCurrentPrompt(prompt);
    textareaRef.current?.focus();
  };

  const canSubmit = currentPrompt.trim().length > 0 && !isSubmitting && !disabled;

  return (
    <div className="space-y-4">
      {/* Model Selection Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Comparing with:</span>
          <div className="flex flex-wrap gap-1">
            {sessionModels.slice(0, 3).map(modelId => {
              const model = getModelById(modelId);
              return (
                <Badge key={modelId} variant="secondary" className="text-xs">
                  {model ? model.name : modelId}
                </Badge>
              );
            })}
            {sessionModels.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{sessionModels.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <Badge variant="outline" className="text-xs">
          {sessionModels.length} model{sessionModels.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Prompt Input */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={currentPrompt}
          onChange={(e) => setCurrentPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something to compare across AI models... (Cmd/Ctrl + Enter to submit)"
          className="min-h-[120px] pr-24 resize-none"
          disabled={disabled}
        />
        
        <div className="absolute bottom-2 right-2 flex items-center space-x-2">
          {/* Prompt History */}
          {promptHistory.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <History className="h-4 w-4" />
                  <span className="sr-only">Recent prompts</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {promptHistory.slice(0, 5).map((prompt, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => insertPrompt(prompt)}
                    className="text-sm whitespace-normal"
                  >
                    <div className="line-clamp-2">{prompt}</div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            size="icon"
            className="h-8 w-8"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send prompt</span>
          </Button>
        </div>

        {/* Character Count */}
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
          {currentPrompt.length} characters
        </div>
      </div>

      {/* Prompt Suggestions
      {currentPrompt.length === 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Try these prompts:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.slice(0, 4).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => insertPrompt(suggestion)}
                disabled={disabled}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )} */}

      {/* Submission Info */}
      <div className="text-xs text-muted-foreground">
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Cmd</kbd> + 
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-1">Enter</kbd>
        <span className="ml-2">to submit</span>
      </div>
    </div>
  );
}