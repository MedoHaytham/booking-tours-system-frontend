'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLoginMutation } from '@/features/authSlice';
import { useAlert } from '@/context/AlertContext';
import { EyeOffIcon, EyeIcon } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [login, { isLoading: loading }] = useLoginMutation();
  const router = useRouter();
  const { showAlert } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login({ email, password }).unwrap();
      showAlert('success', 'Logged in successfully!');
      router.push('/');
      router.refresh();
    } catch (err) {
      setErrorMsg(err?.data?.message || err?.message || 'Could not log in. Try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-error p-4 text-error rounded-sm text-sm font-medium">
          {errorMsg}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-base font-bold mb-2">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="block w-full rounded-sm bg-grey-200 border-t-[3px] border-b-[3px] border-transparent px-7 py-5 text-sm transition-all focus:outline-none focus:border-b-primary placeholder:text-grey-400"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-base font-bold mb-2">
          Password
        </label>
        <div className='relative'>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="block w-full rounded-sm bg-grey-200 border-t-[3px] border-b-[3px] border-transparent px-7 py-5 text-sm transition-all focus:outline-none focus:border-b-primary placeholder:text-grey-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-grey-400 hover:text-grey-600 transition-colors"
          >
            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </div>
        <div className="flex justify-end items-baseline mt-2">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white uppercase flex-1 w-full md:w-auto text-base rounded-full px-12 py-4 transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
        
        <div className="hidden sm:block text-grey-400 text-sm font-semibold uppercase">or</div>
        <div className="sm:hidden w-full flex items-center justify-center gap-3">
          <div className="grow border-t border-grey-200"></div>
          <span className="text-grey-400 text-sm font-semibold uppercase">or</span>
          <div className="grow border-t border-grey-200"></div>
        </div>

        <button
          type="button"
          onClick={() => window.location.href = '/api/v1/users/auth/google'}
          className="flex-2 w-full flex items-center justify-center gap-3 bg-white border border-grey-300 hover:border-grey-400 text-grey-700 text-base font-semibold rounded-full py-4 transition-all hover:bg-grey-50 cursor-pointer"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </form>
  );
}

