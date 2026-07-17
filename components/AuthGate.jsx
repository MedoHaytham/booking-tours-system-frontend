'use client';

import { useGetMeQuery } from '@/features/userSlice';
import LoadingScreen from './LoadingScreen';

export default function AuthGate({ children }) {
  const { isLoading } = useGetMeQuery();

  if (isLoading) return <LoadingScreen />;

  return children;
}