'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMeQuery } from '@/features/userSlice';
import LoadingScreen from './LoadingScreen';

export default function GuestGuard({ children }) {
  const { data, isLoading } = useGetMeQuery();
  const user = data?.data?.data ?? null;
  const router = useRouter();

  useEffect(() => {
    // If the query is not loading and user is authenticated, redirect to home page
    if (!isLoading && user) {
      router.push('/');
    }
  }, [isLoading, user, router]);

  // While checking authentication or if authenticated (redirecting), show loading screen
  if (isLoading || user) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
