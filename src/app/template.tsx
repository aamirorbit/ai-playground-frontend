'use client';

import { MainLayout } from '@/components/layout/main-layout';

interface TemplateProps {
  children: React.ReactNode;
}

export default function Template({ children }: TemplateProps) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}