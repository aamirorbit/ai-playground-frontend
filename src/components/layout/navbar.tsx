'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Sun, Settings, Zap } from 'lucide-react';
import { useAuth, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toggleSidebarAtom } from '@/stores/ui.store';
import { hasActiveSessionAtom, isWebSocketConnectedAtom } from '@/stores/session.store';
import { useTheme } from 'next-themes';

export function Navbar() {
  const [, toggleSidebar] = useAtom(toggleSidebarAtom);
  const [hasActiveSession] = useAtom(hasActiveSessionAtom);
  const [isWSConnected] = useAtom(isWebSocketConnectedAtom);
  const { isSignedIn } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/models':
        return 'Model Selection';
      case '/playground':
        return 'AI Playground';
      case '/history':
        return 'Comparison History';
      case '/analytics':
        return 'Analytics Dashboard';
      default:
        return 'AI Model Playground';
    }
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg hidden sm:inline-block">
              AI Model Playground
            </span>
          </div>
          
          <Badge variant="outline" className="hidden md:inline-flex">
            {pageTitle}
          </Badge>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {hasActiveSession && (
              <Badge variant={isWSConnected ? 'default' : 'destructive'} className="text-xs">
                {isWSConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </Badge>
            )}
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                Light Theme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                Dark Theme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Settings className="mr-2 h-4 w-4" />
                System Theme
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <span className="text-sm text-muted-foreground">
                  Version {process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clerk User Button */}
          {isSignedIn && (
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9"
                }
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}