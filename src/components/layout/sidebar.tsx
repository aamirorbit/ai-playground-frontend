'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import { 
  Bot, 
  History, 
  BarChart3, 
  Zap, 
  ChevronRight,
  Users,
  Clock,
  DollarSign,
  Activity,
  Sun,
  Moon,
  Lock,
  LogIn,
  User,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { 
  sidebarOpenAtom,
  isMobileAtom 
} from '@/stores/ui.store';
import { 
  hasActiveSessionAtom, 
  currentSessionAtom,
  sessionModelsAtom 
} from '@/stores/session.store';
import { historyStatsAtom } from '@/stores/history.store';

const navigation = [
  {
    name: 'Playground',
    href: '/playground',
    icon: Zap,
    description: 'Compare AI model responses',
    requiresAuth: false
  },
  {
    name: 'History',
    href: '/history',
    icon: History,
    description: 'View past comparisons',
    requiresAuth: true
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Performance insights',
    requiresAuth: true
  }
];

export function Sidebar() {
  const [sidebarOpen] = useAtom(sidebarOpenAtom);
  const [isMobile] = useAtom(isMobileAtom);
  const [hasActiveSession] = useAtom(hasActiveSessionAtom);
  const [currentSession] = useAtom(currentSessionAtom);
  const [sessionModels] = useAtom(sessionModelsAtom);
  const [historyStats] = useAtom(historyStatsAtom);
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleNavigation = (href: string, requiresAuth: boolean) => {
    if (requiresAuth && !isSignedIn) {
      // Don't navigate if authentication is required but user is not authenticated
      return;
    }
    router.push(href);
  };

  return (
    <div className="w-72 h-screen flex flex-col fixed left-0 top-0 z-40 p-3">
      {/* Floating Container */}
      <div className="flex-1 glass-effect border-2 border-border/50 rounded-2xl shadow-glow-lg flex flex-col overflow-hidden">
        {/* Logo/Header */}
        <div className="flex items-center space-x-3 px-6 py-6 border-b-2 border-border/30">
          <div className="relative">
            <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/25">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-md shadow-green-500/50" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-none">AI Playground</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Model Comparison Platform</p>
          </div>
        </div>

        {/* Active Session Info */}
        {hasActiveSession && currentSession && (
          <div className="mx-4 mb-6 p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200/50 dark:border-emerald-800/50 rounded-xl shadow-md">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-md shadow-emerald-500/50" />
                  <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Active Session</span>
                </div>
                <Badge className="text-xs font-semibold bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700">
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <Users className="w-3.5 h-3.5" />
                <span>{sessionModels.length} models connected</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <TooltipProvider>
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const isDisabled = item.requiresAuth && (!isSignedIn || !isLoaded);
              
              return (
                <Tooltip key={item.name} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "group relative transition-all duration-200 ease-out",
                        isDisabled 
                          ? "cursor-not-allowed opacity-50" 
                          : "cursor-pointer"
                      )}
                      onClick={() => handleNavigation(item.href, item.requiresAuth)}
                    >
                      {/* Active Indicator Line */}
                      {isActive && !isDisabled && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/70 rounded-r-full shadow-lg shadow-primary/25" />
                      )}
                      
                      {/* Navigation Item */}
                      <div className={cn(
                        "relative flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200",
                        "ml-2 mr-1",
                        isDisabled
                          ? "bg-muted/20 text-muted-foreground/50"
                          : isActive 
                            ? "bg-gradient-to-r from-primary/10 to-primary/5 text-foreground shadow-md border-2 border-primary/20" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:shadow-sm"
                      )}>
                        {/* Icon Container */}
                        <div className={cn(
                          "flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 relative",
                          isDisabled
                            ? "bg-muted/30 text-muted-foreground/50"
                            : isActive 
                              ? "bg-primary/20 text-primary shadow-md" 
                              : "bg-transparent text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          <item.icon className="w-4.5 h-4.5" />
                          {isDisabled && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-muted-foreground/30 rounded-full flex items-center justify-center shadow-sm">
                              <Lock className="w-2 h-2 text-muted-foreground/60" />
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-medium text-sm leading-tight transition-colors duration-200",
                            isDisabled
                              ? "text-muted-foreground/50"
                              : isActive 
                                ? "text-foreground" 
                                : "text-muted-foreground group-hover:text-foreground"
                          )}>
                            {item.name}
                          </div>
                          {isDisabled && (
                            <div className="text-xs text-muted-foreground/40 mt-0.5">
                              Sign in required
                            </div>
                          )}
                        </div>
                        
                        {/* Subtle Arrow for Active State or Lock for Disabled */}
                        {isActive && !isDisabled && (
                          <div className="flex items-center justify-center w-5 h-5">
                            <ChevronRight className="w-3 h-3 text-primary/60" />
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    <p>
                      {isDisabled 
                        ? `Sign in to access ${item.name.toLowerCase()}` 
                        : item.description
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>

        {/* Authentication Section */}
        <div className="px-4 pb-4">
          {!isLoaded ? (
            /* Loading state during auth initialization */
            <div className="w-full p-3.5 bg-muted/30 rounded-xl flex items-center justify-center border-2 border-border/30">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
              <span className="text-sm font-medium text-muted-foreground">Loading...</span>
            </div>
          ) : !isSignedIn ? (
            /* Login Button for Unauthenticated Users */
            <SignInButton mode="modal">
              <Button
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 rounded-xl font-semibold"
                size="default"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </SignInButton>
          ) : (
            /* User Info for Authenticated Users */
            <div className="space-y-3">
              <div className="p-3.5 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center shadow-sm">
                    <User className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {user?.primaryEmailAddress?.emailAddress || user?.fullName || 'User'}
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => signOut()}
                variant="outline"
                size="sm"
                className="w-full text-muted-foreground hover:text-foreground border-2 border-border/50 hover:border-destructive/30 hover:bg-destructive/5 rounded-xl font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-auto">
          {/* Theme Toggle */}
          <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-muted/40 to-muted/20 dark:from-muted/15 dark:to-muted/5 border-2 border-border/30 dark:border-border/20 rounded-xl shadow-md">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative w-full h-12 bg-card border-2 border-border/50 rounded-xl transition-all duration-300 ease-in-out hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 overflow-hidden shadow-sm"
            >
              {/* Toggle Background */}
              <div className="sr-only">Toggle theme</div>
              
              {/* Toggle Slider */}
              <div className={cn(
                "absolute top-1 w-[calc(50%-4px)] h-10 bg-gradient-to-r shadow-lg border-2 border-border/30 rounded-lg transform transition-all duration-300 ease-in-out flex items-center justify-center",
                theme === 'dark' 
                  ? 'translate-x-[calc(100%+8px)] from-slate-800 to-slate-700' 
                  : 'translate-x-1 from-amber-100 to-amber-50'
              )}>
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-slate-100" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-600" />
                )}
              </div>
              
              {/* Background Content */}
              <div className="absolute inset-0 flex items-center">
                {/* Light Mode Side */}
                <div className="flex-1 flex items-center justify-center space-x-2">
                  <Sun className={cn(
                    "w-4 h-4 transition-all duration-300",
                    theme === 'light' ? 'opacity-0' : 'opacity-70 text-amber-500'
                  )} />
                  <span className={cn(
                    "text-sm font-semibold transition-all duration-300",
                    theme === 'light' ? 'opacity-0' : 'opacity-90 text-muted-foreground'
                  )}>
                    Light
                  </span>
                </div>
                
                {/* Dark Mode Side */}
                <div className="flex-1 flex items-center justify-center space-x-2">
                  <Moon className={cn(
                    "w-4 h-4 transition-all duration-300",
                    theme === 'dark' ? 'opacity-0' : 'opacity-70 text-slate-600'
                  )} />
                  <span className={cn(
                    "text-sm font-semibold transition-all duration-300",
                    theme === 'dark' ? 'opacity-0' : 'opacity-90 text-muted-foreground'
                  )}>
                    Dark
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}