'use client';

import { use } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { useConfirmEmailQuery } from '@/features/authSlice';

export default function ConfirmEmailPage({ params }) {
  const { confirmationToken } = use(params);

  const { isLoading, isSuccess, isError, error } = useConfirmEmailQuery(confirmationToken);

  return (
    <main className="bg-grey-100 min-h-[80vh] px-6 py-20 flex items-center justify-center">
      <div className="w-full max-w-lg animate-move-in-bottom">
        <div className="bg-white shadow-login rounded-2xl px-8 sm:px-12 py-14 sm:py-20 relative overflow-hidden text-center">

          {/* Decorative gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary rounded-t-2xl" />

          {/* Loading */}
          {isLoading && (
            <>
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 size={38} className="text-primary animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-4">
                Verifying Email…
              </h1>
              <p className="text-sm text-grey-400">
                Please wait while we confirm your email address.
              </p>
            </>
          )}

          {/* Success */}
          {isSuccess && (
            <>
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={48} className="text-green-500" />
                  </div>
                  {/* Pulsing ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-30" />
                </div>
              </div>

              <h1 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-3">
                Email Confirmed!
              </h1>
              <p className="text-base text-grey-600 mb-2">
                Your email address has been verified successfully.
              </p>
              <p className="text-sm text-grey-400 mb-10">
                Your account is now active and you&apos;re ready to explore amazing tours.
              </p>

              {/* Badges */}
              <div className="flex justify-center gap-3 mb-10 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                  <CheckCircle2 size={12} /> Account Active
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                  <Mail size={12} /> Email Verified
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-primary text-white text-sm font-bold uppercase rounded-full px-8 py-4 transition-transform hover:-translate-y-0.5 shadow-sm"
                >
                  Log In Now
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 border border-grey-200 hover:border-primary text-grey-600 hover:text-primary text-sm font-semibold rounded-full px-8 py-4 transition-colors"
                >
                  Browse Tours
                </Link>
              </div>
            </>
          )}

          {/* Error / Not Confirmed */}
          {isError && (
            <>
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle size={48} className="text-red-500" />
                </div>
              </div>

              <h1 className="text-2xl uppercase font-bold text-red-500 tracking-wide mb-3">
                Not Confirmed
              </h1>
              <p className="text-base text-grey-600 mb-2">
                We couldn&apos;t verify your email address.
              </p>
              <p className="text-sm text-grey-400 mb-3">
                {error?.data?.message || 'The confirmation link is invalid or has expired.'}
              </p>
              <p className="text-xs text-grey-300 mb-10">
                Confirmation links expire after 10 minutes. Please sign up again to get a new link.
              </p>

              {/* Badge */}
              <div className="flex justify-center mb-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                  <XCircle size={12} /> Email Not Verified
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-primary text-white text-sm font-bold uppercase rounded-full px-8 py-4 transition-transform hover:-translate-y-0.5 shadow-sm"
                >
                  Sign Up Again
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 border border-grey-200 hover:border-primary text-grey-600 hover:text-primary text-sm font-semibold rounded-full px-8 py-4 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
