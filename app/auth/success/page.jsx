'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAlert } from '@/context/AlertContext';
import { Loader2 } from 'lucide-react';

export default function AuthSuccessPage() {
  const { showAlert } = useAlert();
  const searchParams = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get('token');

    // No token in URL means something is wrong or someone opened the page directly
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // This request is same-origin (it passes through Next.js rewrite proxy)
    // So the cookie returned in the response will be correctly saved on the frontend domain
    fetch('/api/v1/users/auth/exchange', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Exchange failed');
        showAlert('success', 'Logged in successfully with Google!');
        window.location.href = '/';
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, [searchParams, showAlert]);

  return (
    <main className="bg-grey-100 min-h-[80vh] px-6 py-20 flex items-center justify-center">
      <div className="w-full max-w-lg text-center bg-white shadow-login rounded-2xl px-8 py-14 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary rounded-t-2xl" />
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 size={38} className="text-primary animate-spin" />
          </div>
        </div>
        <h1 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-4">
          Logging you in…
        </h1>
        <p className="text-sm text-grey-400">
          Please wait while we complete your Google sign in.
        </p>
      </div>
    </main>
  );
}