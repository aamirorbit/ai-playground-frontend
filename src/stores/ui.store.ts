import { atom } from 'jotai';

// Theme management
export const themeAtom = atom<'light' | 'dark' | 'system'>('dark');

// Layout and navigation
export const sidebarOpenAtom = atom<boolean>(false);
export const currentPageAtom = atom<'models' | 'playground' | 'history' | 'analytics'>('models');

// Modal and dialog states
export const showModelSelectionDialogAtom = atom<boolean>(false);
export const showSessionEndDialogAtom = atom<boolean>(false);
export const showHistoryDetailsDialogAtom = atom<boolean>(false);
export const selectedHistoryItemIdAtom = atom<string | null>(null);

// Loading states
export const globalLoadingAtom = atom<boolean>(false);
export const pageLoadingAtom = atom<boolean>(false);

// Error handling
export const globalErrorAtom = atom<string | null>(null);
export const notificationsAtom = atom<Array<{
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: Date;
  duration?: number;
}>>([]);

// Notification actions
export const addNotificationAtom = atom(
  null,
  (get, set, notification: Omit<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    timestamp: Date;
    duration?: number;
  }, 'id' | 'timestamp'>) => {
    const current = get(notificationsAtom);
    const newNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      duration: notification.duration || 5000
    };
    
    set(notificationsAtom, [...current, newNotification]);
    
    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        set(notificationsAtom, prev => 
          prev.filter(n => n.id !== newNotification.id)
        );
      }, newNotification.duration);
    }
  }
);

export const removeNotificationAtom = atom(
  null,
  (get, set, notificationId: string) => {
    const current = get(notificationsAtom);
    set(notificationsAtom, current.filter(n => n.id !== notificationId));
  }
);

export const clearAllNotificationsAtom = atom(
  null,
  (get, set) => {
    set(notificationsAtom, []);
  }
);

// Layout responsive states
export const isMobileAtom = atom<boolean>(false);
export const isTabletAtom = atom<boolean>(false);

// Comparison view settings
export const comparisonViewModeAtom = atom<'side-by-side' | 'tabs'>('side-by-side');
export const showModelMetricsAtom = atom<boolean>(true);
export const showMarkdownPreviewAtom = atom<boolean>(true);

// Performance metrics display
export const showPerformanceMetricsAtom = atom<boolean>(true);
export const metricsUpdateIntervalAtom = atom<number>(1000); // ms

// Prompt input settings
export const promptHistoryAtom = atom<string[]>([]);
export const currentPromptAtom = atom<string>('');
export const isSubmittingPromptAtom = atom<boolean>(false);

export const addPromptToHistoryAtom = atom(
  null,
  (get, set, prompt: string) => {
    if (!prompt.trim()) return;
    
    const current = get(promptHistoryAtom);
    const filtered = current.filter(p => p !== prompt);
    const updated = [prompt, ...filtered].slice(0, 50); // Keep last 50 prompts
    
    set(promptHistoryAtom, updated);
  }
);

// Export and import settings
export const exportFormatAtom = atom<'json' | 'csv' | 'markdown'>('json');
export const includeMetricsInExportAtom = atom<boolean>(true);

// Accessibility settings
export const reduceMotionAtom = atom<boolean>(false);
export const highContrastAtom = atom<boolean>(false);

// Developer settings (for debugging)
export const debugModeAtom = atom<boolean>(false);
export const showWebSocketLogsAtom = atom<boolean>(false);

// Quick actions
export const toggleSidebarAtom = atom(
  null,
  (get, set) => {
    const current = get(sidebarOpenAtom);
    set(sidebarOpenAtom, !current);
  }
);

export const setPageAtom = atom(
  null,
  (get, set, page: 'models' | 'playground' | 'history' | 'analytics') => {
    set(currentPageAtom, page);
    // Close sidebar on mobile when navigating
    if (get(isMobileAtom)) {
      set(sidebarOpenAtom, false);
    }
  }
);

// Error handling helpers
export const setGlobalErrorAtom = atom(
  null,
  (get, set, error: string | null) => {
    set(globalErrorAtom, error);
    
    if (error) {
      // Add error notification
      set(addNotificationAtom, {
        type: 'error',
        title: 'Error',
        message: error,
        duration: 8000
      });
    }
  }
);

export const clearGlobalErrorAtom = atom(
  null,
  (get, set) => {
    set(globalErrorAtom, null);
  }
);