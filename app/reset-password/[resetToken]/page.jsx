'use client';

import { useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, EyeIcon, EyeOffIcon, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useResetPasswordMutation } from '@/features/authSlice';
import { useAlert } from '@/context/AlertContext';

export default function ResetPasswordPage({ params }) {
  const { resetToken } = use(params);
  const router = useRouter();
  const { showAlert } = useAlert();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [done, setDone] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== passwordConfirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    try {
      await resetPassword({ resetToken, newPassword: password, confirmNewPassword: passwordConfirm }).unwrap();
      setDone(true);
      setTimeout(() => {
        showAlert('success', 'Password reset! You are now logged in.');
        router.push('/');
      }, 2000);
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Invalid or expired reset link. Please request a new one.');
    }
  };

  return (
    <main className="bg-grey-100 min-h-[80vh] px-6 py-20 flex items-center justify-center">
      <div className="w-full max-w-lg animate-move-in-bottom">
        <div className="bg-white shadow-login rounded-2xl px-8 sm:px-12 py-12 sm:py-16 relative overflow-hidden">

          {/* Decorative gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary rounded-t-2xl" />

          {!done ? (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Lock size={28} className="text-primary" />
                </div>
              </div>

              <h1 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide text-center mb-3">
                Reset Password
              </h1>
              <p className="text-sm text-grey-500 text-center mb-10">
                Choose a strong new password for your account.
              </p>

              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-error p-4 text-error rounded-md text-sm font-medium mb-6">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-bold text-grey-600 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="block w-full pl-11 pr-12 py-4 rounded-[4px] bg-grey-200 border-t-[3px] border-b-[3px] border-transparent text-sm transition-all focus:outline-none focus:border-b-primary placeholder:text-grey-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-grey-400 hover:text-grey-600 transition-colors"
                    >
                      {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  {/* Strength hint */}
                  {password && (
                    <div className="mt-2 flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            password.length > i * 3 + 2
                              ? password.length >= 12 ? 'bg-green-400' : password.length >= 8 ? 'bg-amber-400' : 'bg-red-400'
                              : 'bg-grey-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-bold text-grey-600 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400" />
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      className={`block w-full pl-11 pr-12 py-4 rounded-[4px] bg-grey-200 border-t-[3px] border-b-[3px] border-transparent text-sm transition-all focus:outline-none placeholder:text-grey-400 ${
                        passwordConfirm && password !== passwordConfirm
                          ? 'border-b-red-400'
                          : passwordConfirm && password === passwordConfirm
                          ? 'border-b-green-400'
                          : 'focus:border-b-primary'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-grey-400 hover:text-grey-600 transition-colors"
                    >
                      {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  {passwordConfirm && password !== passwordConfirm && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                  {passwordConfirm && password === passwordConfirm && (
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Passwords match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-primary text-white uppercase text-sm font-bold rounded-full px-10 py-4 transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Resetting…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Reset Password
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  href="/login"
                  className="text-sm text-grey-400 hover:text-primary transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            /* Success state */
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={42} className="text-green-500" />
                </div>
              </div>
              <h1 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-4">
                Password Reset!
              </h1>
              <p className="text-sm text-grey-500 mb-2">
                Your password has been changed successfully.
              </p>
              <p className="text-xs text-grey-400 mt-4 flex items-center justify-center gap-1">
                <span className="w-3 h-3 border-2 border-grey-300 border-t-primary rounded-full animate-spin" />
                Redirecting you…
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
