'use client';

import { use } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import GuestGuard from '@/components/GuestGuard';

export default function VerifyEmailPage({ searchParams }) {
  const resolvedSearchParams = use(searchParams);
  const email = resolvedSearchParams?.email || '';

  return (
    <GuestGuard>
      <main className="bg-grey-100 min-h-[80vh] px-6 py-20 flex items-center justify-center">
        <div className="w-full max-w-lg animate-move-in-bottom">
          <div className="bg-white shadow-login rounded-2xl px-8 sm:px-12 py-12 sm:py-16 relative overflow-hidden">
            
            {/* Decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary rounded-t-2xl" />

            <div className="text-center">
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center relative">
                  <Mail size={40} className="text-primary animate-pulse" />
                  {/* Subtle pulsing badge */}
                  <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                </div>
              </div>

              <h1 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-4">
                Verify your email
              </h1>

              <p className="text-base text-grey-600 mb-6 font-medium">
                Please check your email inbox and verify your email
              </p>

              {email && (
                <div className="mb-8">
                  <p className="text-sm text-grey-400 mb-2">We sent a verification link to:</p>
                  <p className="text-sm font-bold text-grey-700 bg-grey-100 px-4 py-2.5 rounded-lg inline-block break-all border border-grey-200">
                    {email}
                  </p>
                </div>
              )}

              <p className="text-sm text-grey-400 mb-10 leading-relaxed max-w-sm mx-auto">
                We sent an email verification link to your address. Please click on the link to verify your email and activate your account.
              </p>

              {/* Status Badge */}
              <div className="flex justify-center gap-3 mb-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 animate-pulse">
                  <CheckCircle2 size={12} /> Verification Pending
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-primary text-white text-sm font-bold uppercase rounded-full px-8 py-4 transition-transform hover:-translate-y-0.5 shadow-sm w-full sm:w-auto text-center"
                >
                  Go to Login
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 border border-grey-200 hover:border-primary text-grey-600 hover:text-primary text-sm font-semibold rounded-full px-8 py-4 transition-colors w-full sm:w-auto text-center"
                >
                  <ArrowLeft size={15} />
                  Back to Home
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>
    </GuestGuard>
  );
}
