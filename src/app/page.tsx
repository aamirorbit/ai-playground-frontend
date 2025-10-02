'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to playground page as the default
    router.replace('/playground');
  }, [router]);

  // Show nothing while redirecting
  return null;
}
