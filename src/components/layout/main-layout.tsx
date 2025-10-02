'use client';

import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Sidebar } from './sidebar';
import { NotificationToaster } from '../ui/notification-toaster';
import { ClientOnly } from '../ui/client-only';
import { MobileRestriction } from '../ui/mobile-restriction';
import { isMobileAtom, isTabletAtom } from '@/stores/ui.store';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobile, setIsMobile] = useAtom(isMobileAtom);
  const [, setIsTablet] = useAtom(isTabletAtom);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [setIsMobile, setIsTablet]);

  return (
    <ClientOnly>
      {isMobile ? (
        // Show mobile restriction with funny message
        <MobileRestriction />
      ) : (
        // Show normal desktop layout
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
               style={{
                 backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                 backgroundSize: '40px 40px'
               }}
          />
          
          <Sidebar />
          
          <main className="min-h-screen ml-72 relative">
            <div className="container mx-auto p-6 max-w-none">
              {children}
            </div>
          </main>
          
          <NotificationToaster />
        </div>
      )}
    </ClientOnly>
  );
}