'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useForgotPasswordMutation } from '@/features/authSlice';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await forgotPassword({ email }).unwrap();
      setSent(true);
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <main className="bg-grey-100 min-h-[80vh] px-6 py-20 flex items-center justify-center">
      <div className="w-full max-w-lg animate-move-in-bottom">
        <div className="bg-white shadow-login rounded-2xl px-8 sm:px-12 py-12 sm:py-16 relative overflow-hidden">

          {/* Decorative gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary rounded-t-2xl" />

          {!sent ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Mail size={30} className="text-primary" />
                </div>
              </div>

              <h1 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide text-center mb-3">
                Forgot Password?
              </h1>
              <p className="text-sm text-grey-500 text-center mb-10">
                No worries! Enter your email and we&apos;ll send you a reset link.
              </p>

              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-error p-4 text-error rounded-md text-sm font-medium mb-6">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-bold text-grey-600 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="block w-full pl-11 pr-5 py-4 rounded-[4px] bg-grey-200 border-t-[3px] border-b-[3px] border-transparent text-sm transition-all focus:outline-none focus:border-b-primary placeholder:text-grey-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-primary text-white uppercase text-sm font-bold rounded-full px-10 py-4 transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-grey-500 hover:text-primary transition-colors font-medium"
                >
                  <ArrowLeft size={15} />
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
              </div>

              <h1 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-4">
                Check Your Email
              </h1>
              <p className="text-sm text-grey-500 mb-2">
                We&apos;ve sent a password reset link to:
              </p>
              <p className="text-sm font-bold text-grey-700 mb-8 bg-grey-100 px-4 py-2 rounded-lg inline-block">
                {email}
              </p>
              <p className="text-xs text-grey-400 mb-10">
                The link will expire in a few minutes. Check your spam folder if you don&apos;t see it.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="inline-flex items-center justify-center gap-2 text-sm text-grey-500 hover:text-primary border border-grey-200 hover:border-primary rounded-full px-6 py-3 transition-colors font-medium"
                >
                  <ArrowLeft size={15} />
                  Try different email
                </button>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-primary text-white text-sm font-bold rounded-full px-6 py-3 transition-transform hover:-translate-y-0.5"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
