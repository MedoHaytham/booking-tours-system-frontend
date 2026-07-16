'use client';

import { useEffect, useRef } from 'react';
import { useAlert } from '@/context/AlertContext';
import { Loader2 } from 'lucide-react';

export default function AuthSuccessPage() {
  const { showAlert } = useAlert();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    // The JWT cookie has already been set by the backend redirect.
    // Show the success alert then do a hard navigation to "/" so that
    // the entire Next.js app re-initialises with the new cookie in place.
    // Using window.location instead of router.push ensures the RTK Query
    // cache starts clean with the fresh cookie automatically included.
    showAlert('success', 'Logged in successfully with Google!');
    window.location.href = '/';
  }, [showAlert]);

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
