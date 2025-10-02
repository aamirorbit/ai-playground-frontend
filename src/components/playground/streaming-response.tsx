'use client';

import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Clock, DollarSign, Zap, CheckCircle, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { StreamingState } from '@/types/api';
import { streamingStateAtom } from '@/stores/session.store';
import { showPerformanceMetricsAtom } from '@/stores/ui.store';
import { getModelByIdAtom } from '@/stores/models.store';

interface StreamingResponseProps {
  modelId: string;
}

const statusConfig = {
  idle: { color: 'text-muted-foreground', icon: Loader2, label: 'Waiting...' },
  typing: { color: 'text-blue-500', icon: Loader2, label: 'Thinking...' },
  streaming: { color: 'text-green-500', icon: Zap, label: 'Streaming...' },
  complete: { color: 'text-green-600', icon: CheckCircle, label: 'Complete' },
  error: { color: 'text-red-500', icon: AlertCircle, label: 'Error' },
};

export function StreamingResponse({ modelId }: StreamingResponseProps) {
  const [streamingState] = useAtom(streamingStateAtom);
  const [showPerformanceMetrics] = useAtom(showPerformanceMetricsAtom);
  const [getModelById] = useAtom(getModelByIdAtom);
  const [typingDots, setTypingDots] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const model = getModelById(modelId);
  const status = streamingState.modelStatus[modelId] || 'idle';
  const response = streamingState.modelResponses[modelId] || '';
  const metrics = streamingState.performanceMetrics[modelId];
  
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  // Typing animation effect
  useEffect(() => {
    if (status === 'typing' || status === 'streaming') {
      const interval = setInterval(() => {
        setTypingDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    } else {
      setTypingDots('');
    }
  }, [status]);

  // Copy code function
  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  // Calculate reading progress for streaming text
  const estimatedTotalChars = 1000; // Rough estimate
  const currentChars = response.length;
  const readingProgress = status === 'complete' ? 100 : Math.min((currentChars / estimatedTotalChars) * 100, 95);

  if (!model) return null;

  return (
    <Card className={cn(
      "h-[500px] transition-all duration-300 flex flex-col border-2 rounded-2xl overflow-hidden",
      status === 'complete' && "border-green-500/30 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20 shadow-glow",
      status === 'error' && "border-red-500/30 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/20",
      status === 'streaming' && "border-primary/30 shadow-glow",
      status !== 'complete' && status !== 'error' && status !== 'streaming' && "border-border/50"
    )}>
      <CardHeader className="pb-3 bg-gradient-to-r from-card to-card/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2.5">
            <div 
              className={cn(
                "w-3 h-3 rounded-full shadow-md",
                model.provider === 'OpenAI' && "bg-green-500 shadow-green-500/50",
                model.provider === 'Anthropic' && "bg-orange-500 shadow-orange-500/50",
                model.provider === 'xAI' && "bg-purple-500 shadow-purple-500/50"
              )}
            />
            <span className="font-bold">{model.name}</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <StatusIcon 
              className={cn(
                "h-4 w-4",
                statusInfo.color,
                (status === 'typing' || status === 'streaming') && "animate-spin"
              )} 
            />
            <Badge 
              variant={status === 'complete' ? 'default' : 'secondary'}
              className={cn(
                "text-xs font-medium",
                status === 'complete' && "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
                status === 'streaming' && "bg-primary/10 text-primary border-primary/20"
              )}
            >
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        {(status === 'streaming' || status === 'typing') && (
          <div className="space-y-1.5 mt-3">
            <Progress value={readingProgress} className="h-1.5 bg-muted" />
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>{currentChars} characters</span>
              {metrics?.charsPerSec && (
                <span className="text-primary">{metrics.charsPerSec} chars/sec</span>
              )}
            </div>
          </div>
        )}

        {/* Performance Metrics - Controlled by toggle */}
        {metrics && status === 'complete' && showPerformanceMetrics && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl px-4 py-2.5 mt-3 border border-border/50">
            <div className="flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>{(metrics.duration / 1000).toFixed(1)}s</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>{metrics.charsPerSec} c/s</span>
            </div>
            {metrics.cost && (
              <div className="flex items-center space-x-1.5">
                <DollarSign className="h-3.5 w-3.5 text-green-500" />
                <span>${metrics.cost.toFixed(6)}</span>
              </div>
            )}
            {metrics.tokens && (
              <div className="flex items-center space-x-1.5">
                <span className="text-foreground font-semibold">{metrics.tokens.total_tokens} tokens</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <div className={cn(
          "prose prose-sm max-w-none dark:prose-invert h-full overflow-y-auto",
          "prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed",
          "prose-code:text-foreground prose-pre:bg-muted prose-pre:border prose-pre:border-border/50",
          "prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:my-4",
          "prose-ul:space-y-1 prose-ol:space-y-1 prose-li:text-foreground",
          "prose-strong:text-foreground prose-strong:font-semibold",
          "prose-em:text-foreground prose-em:italic",
          "prose-h1:text-xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-6 prose-h1:border-b prose-h1:border-border/30 prose-h1:pb-2",
          "prose-h2:text-lg prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-5",
          "prose-h3:text-base prose-h3:font-medium prose-h3:mb-2 prose-h3:mt-4",
          "prose-table:border prose-table:border-border prose-th:bg-muted prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2",
          "prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2"
        )}>
          {response ? (
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                // Enhanced code blocks with copy functionality
                pre: ({ children, ...props }) => {
                  // Extract text content from children more safely
                  const extractTextFromChildren = (node: React.ReactNode): string => {
                    if (typeof node === 'string') {
                      return node;
                    }
                    if (typeof node === 'number') {
                      return String(node);
                    }
                    if (React.isValidElement(node)) {
                      const element = node as React.ReactElement<{ children?: React.ReactNode }>;
                      if (element.props && 'children' in element.props && element.props.children) {
                        return extractTextFromChildren(element.props.children);
                      }
                    }
                    if (Array.isArray(node)) {
                      return node.map(extractTextFromChildren).join('');
                    }
                    return '';
                  };

                  const codeContent = extractTextFromChildren(children);
                  const isCopied = copiedCode === codeContent;

                  return (
                    <div className="relative group">
                      <pre 
                        {...props} 
                        className="bg-gradient-to-br from-muted via-muted to-muted/80 p-4 pr-12 rounded-lg overflow-x-auto text-sm border border-border/50 shadow-sm"
                      >
                        {children}
                      </pre>
                      
                      {/* Copy Button */}
                      <button
                        onClick={() => copyCode(codeContent)}
                        className="absolute top-2 right-2 p-2 rounded-md bg-background/80 hover:bg-background border border-border/50 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 shadow-sm"
                        title={isCopied ? "Copied!" : "Copy code"}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                    </div>
                  );
                },
                
                // Inline code with better styling
                code: ({ children, className, ...props }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code 
                      {...props} 
                      className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-sm border border-primary/20"
                    >
                      {children}
                    </code>
                  ) : (
                    <code {...props} className={cn(className, "font-mono")}>
                      {children}
                    </code>
                  );
                },

                // Enhanced headings with better spacing
                h1: ({ children, ...props }) => (
                  <h1 {...props} className="text-xl font-bold mb-4 mt-6 pb-2 border-b border-border/30 text-foreground">
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2 {...props} className="text-lg font-semibold mb-3 mt-5 text-foreground">
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3 {...props} className="text-base font-medium mb-2 mt-4 text-foreground">
                    {children}
                  </h3>
                ),

                // Better blockquotes
                blockquote: ({ children, ...props }) => (
                  <blockquote 
                    {...props} 
                    className="border-l-4 border-l-primary bg-muted/30 pl-4 py-2 my-4 italic text-muted-foreground rounded-r-md"
                  >
                    {children}
                  </blockquote>
                ),

                // Enhanced lists
                ul: ({ children, ...props }) => (
                  <ul {...props} className="space-y-1 list-disc list-inside text-foreground ml-4">
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol {...props} className="space-y-1 list-decimal list-inside text-foreground ml-4">
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li {...props} className="text-foreground leading-relaxed">
                    {children}
                  </li>
                ),

                // Better paragraphs
                p: ({ children, ...props }) => (
                  <p {...props} className="text-foreground leading-relaxed mb-4">
                    {children}
                  </p>
                ),

                // Enhanced tables
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table {...props} className="w-full border-collapse border border-border rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children, ...props }) => (
                  <th {...props} className="bg-muted font-semibold text-foreground border border-border px-3 py-2 text-left">
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td {...props} className="text-foreground border border-border px-3 py-2">
                    {children}
                  </td>
                ),

                // Strong and emphasis
                strong: ({ children, ...props }) => (
                  <strong {...props} className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                em: ({ children, ...props }) => (
                  <em {...props} className="italic text-foreground">
                    {children}
                  </em>
                ),
              }}
            >
              {response}
            </ReactMarkdown>
          ) : status === 'idle' ? (
            <div className="text-muted-foreground text-center py-8">
              <div className="text-lg mb-2">Ready to respond</div>
              <div className="text-sm">Waiting for your prompt...</div>
            </div>
          ) : status === 'typing' ? (
            <div className="text-muted-foreground text-center py-8">
              <div className="text-lg mb-2">Processing{typingDots}</div>
              <div className="text-sm">The model is thinking...</div>
            </div>
          ) : status === 'error' ? (
            <div className="text-red-500 text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <div className="text-lg mb-2">Response Error</div>
              <div className="text-sm">{response}</div>
            </div>
          ) : null}

          {/* Streaming cursor effect */}
          {(status === 'streaming' || status === 'typing') && response && (
            <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}