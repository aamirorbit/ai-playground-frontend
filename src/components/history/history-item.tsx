'use client';

import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { 
  Clock, 
  DollarSign, 
  Eye,
  MessageSquare, 
  Trash2, 
  ExternalLink,
  Copy,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { HistoryItem as HistoryItemType } from '@/types/api';
import { removeHistoryItemAtom } from '@/stores/history.store';
import { getModelByIdAtom } from '@/stores/models.store';

interface HistoryItemProps {
  item: HistoryItemType;
}

export function HistoryItem({ item }: HistoryItemProps) {
  const [, removeHistoryItem] = useAtom(removeHistoryItemAtom);
  const [getModelById] = useAtom(getModelByIdAtom);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  const modelResponses = Object.entries(item.results);
  const totalCost = Object.values(item.results).reduce((acc, result) => 
    acc + (result.costEstimateUsd || 0), 0
  );

  // Helper function to get full model name
  const getModelName = (modelId: string) => {
    const model = getModelById(modelId);
    return model ? model.name : modelId;
  };
  const totalTokens = Object.values(item.results).reduce((acc, result) => 
    acc + (result.tokens?.total_tokens || 0), 0
  );
  const averageTime = Object.values(item.results).reduce((acc, result, _, arr) => 
    acc + result.timeTakenMs / arr.length, 0
  );

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove this comparison from history?')) {
      removeHistoryItem(item.id);
    }
  };

  return (
    <TooltipProvider>
      <Card className="transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-start gap-2">
                <CardTitle className="text-base line-clamp-2 flex-1 leading-relaxed">
                  {item.prompt}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0 mt-0.5"
                  onClick={handleCopyPrompt}
                >
                  {copiedPrompt ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span className="sr-only">Copy prompt</span>
                </Button>
              </div>
              
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs sm:text-xs">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{modelResponses.length} models</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${totalCost.toFixed(6)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 sm:flex-shrink-0">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View details</p>
                  </TooltipContent>
                </Tooltip>
                <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[90vw] sm:w-[90vw] md:max-w-[85vw] md:w-[85vw] lg:max-w-[80vw] lg:w-[80vw] xl:max-w-[75vw] xl:w-[75vw] max-h-[95vh] overflow-y-auto bg-background border shadow-2xl">
                  <DialogHeader className="border-b pb-6">
                    <div className="space-y-4">
                      <div>
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">Comparison Analysis</DialogTitle>
                        <DialogDescription className="mt-2 sm:mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
                          Review the detailed comparison results between different AI models
                        </DialogDescription>
                      </div>
                      <div className="bg-muted/50 p-3 sm:p-4 rounded-lg border-l-4 border-primary">
                        <span className="font-medium text-muted-foreground text-sm">Prompt:</span>
                        <div className="mt-1 text-foreground text-sm sm:text-base break-words">{item.prompt}</div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{modelResponses.length} models compared</span>
                        </div>
                      </div>
                    </div>
                  </DialogHeader>
                  
                  <div className="space-y-8 mt-6">
                    {/* Enhanced Summary Stats */}
                    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 sm:p-6 rounded-xl border border-primary/20">
                      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">Performance Summary</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        <div className="text-center p-3 sm:p-4 bg-background/80 rounded-lg border border-border/50">
                          <div className="text-lg sm:text-xl font-bold text-primary">{modelResponses.length}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground font-medium">Models Compared</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-background/80 rounded-lg border border-border/50">
                          <div className="text-lg sm:text-xl font-bold text-emerald-600">{(averageTime / 1000).toFixed(1)}s</div>
                          <div className="text-xs sm:text-sm text-muted-foreground font-medium">Average Response Time</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-background/80 rounded-lg border border-border/50">
                          <div className="text-lg sm:text-xl font-bold text-blue-600">{totalTokens.toLocaleString()}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground font-medium">Total Tokens Used</div>
                        </div>
                        <div className="text-center p-3 sm:p-4 bg-background/80 rounded-lg border border-border/50">
                          <div className="text-lg sm:text-xl font-bold text-amber-600">${totalCost.toFixed(6)}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground font-medium">Total Cost</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Enhanced Model Responses - Tabbed Interface */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground">Model Responses</h3>
                        <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 self-start sm:self-auto">
                          {modelResponses.length} responses to analyze
                        </Badge>
                      </div>
                      
                      <Tabs defaultValue={modelResponses[0]?.[0]} className="w-full">
                        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-4 sm:mb-6 h-auto p-1">
                          {modelResponses.map(([modelId, result]) => (
                            <TabsTrigger key={modelId} value={modelId} className="text-xs sm:text-sm relative p-2 sm:p-3 whitespace-nowrap overflow-hidden text-ellipsis">
                              <span className="truncate">{getModelName(modelId)}</span>
                              {result.error && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></div>
                              )}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {modelResponses.map(([modelId, result], index) => (
                          <TabsContent key={modelId} value={modelId} className="mt-0">
                            <Card className="overflow-hidden border-2">
                              <CardHeader className="border-b p-3 sm:p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm">
                                      {index + 1}
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                      <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1 font-semibold">
                                        {getModelName(modelId)}
                                      </Badge>
                                      {result.error && (
                                        <Badge variant="destructive" className="text-xs">Error</Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm">
                                    {result.tokens && (
                                      <div className="flex items-center space-x-1 text-blue-600">
                                        <span className="font-medium">{result.tokens.total_tokens.toLocaleString()}</span>
                                        <span className="text-muted-foreground">tokens</span>
                                      </div>
                                    )}
                                    <div className="flex items-center space-x-1 text-emerald-600">
                                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span className="font-medium">{(result.timeTakenMs / 1000).toFixed(1)}s</span>
                                    </div>
                                    {result.costEstimateUsd && (
                                      <div className="flex items-center space-x-1 text-amber-600">
                                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="font-medium">${result.costEstimateUsd.toFixed(6)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>

                              <CardContent className="p-3 sm:p-6">
                                <div className={cn(
                                  "prose prose-sm sm:prose-base max-w-none dark:prose-invert h-full overflow-y-auto",
                                  "prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed",
                                  "prose-code:text-foreground prose-pre:bg-muted prose-pre:border prose-pre:border-border/50",
                                  "prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:my-4",
                                  "prose-ul:space-y-1 prose-ol:space-y-1 prose-li:text-foreground",
                                  "prose-strong:text-foreground prose-strong:font-semibold",
                                  "prose-em:text-foreground prose-em:italic",
                                  "prose-h1:text-xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-6 prose-h1:border-b prose-h1:border-border/30 prose-h1:pb-2",
                                  "prose-h2:text-lg prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-5",
                                  "prose-h3:text-base prose-h3:font-medium prose-h3:mb-2 prose-h3:mt-4",
                                  "prose-table:border prose-table:border-border prose-th:bg-muted prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2"
                                )}>
                                  {result.error ? (
                                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-6">
                                      <div className="flex items-center space-x-2 mb-3">
                                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0" />
                                        <span className="font-semibold text-destructive text-sm sm:text-base">Error Occurred</span>
                                      </div>
                                      <p className="text-destructive/90 text-sm sm:text-base break-words">{result.error}</p>
                                    </div>
                                  ) : result.response ? (
                                    <div className="min-h-[150px] sm:min-h-[200px] overflow-hidden break-words">
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
                                        {result.response}
                                      </ReactMarkdown>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center py-8 sm:py-12 text-muted-foreground">
                                      <div className="text-center">
                                        <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                                        <p className="italic text-sm sm:text-base">No response available</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={handleRemove}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove from history</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove from history</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Model badges */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {modelResponses.map(([modelId, result]) => (
              <Badge 
                key={modelId} 
                variant={result.error ? "destructive" : "secondary"}
                className="text-xs sm:text-xs px-2 py-1 truncate max-w-[120px] sm:max-w-none"
                title={getModelName(modelId)}
              >
                {getModelName(modelId)}
              </Badge>
            ))}
          </div>
        </CardHeader>


      </Card>
    </TooltipProvider>
  );
}