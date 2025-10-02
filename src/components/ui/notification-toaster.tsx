'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { notificationsAtom, removeNotificationAtom } from '@/stores/ui.store';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
  error: 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
  warning: 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
  info: 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100',
};

export function NotificationToaster() {
  const [notifications] = useAtom(notificationsAtom);
  const [, removeNotification] = useAtom(removeNotificationAtom);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 w-96 max-w-[calc(100vw-2rem)]">
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type];
        
        return (
          <div
            key={notification.id}
            className={cn(
              "border rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2 duration-300",
              colorMap[notification.type]
            )}
          >
            <div className="flex items-start space-x-3">
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">{notification.title}</h4>
                {notification.message && (
                  <p className="text-sm mt-1 opacity-90">
                    {notification.message}
                  </p>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-70 hover:opacity-100"
                onClick={() => removeNotification(notification.id)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close notification</span>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}