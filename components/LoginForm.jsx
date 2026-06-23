'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/features/authSlice';
import { useAlert } from '@/context/AlertContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
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
        <div className="bg-red-50 border-l-4 border-error p-4 text-error rounded-[4px] text-sm font-medium">
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
          className="block w-full rounded-[4px] bg-grey-200 border-t-[3px] border-b-[3px] border-transparent px-7 py-5 text-sm transition-all focus:outline-none focus:border-b-primary placeholder:text-grey-400"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-base font-bold mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="block w-full rounded-[4px] bg-grey-200 border-t-[3px] border-b-[3px] border-transparent px-7 py-5 text-sm transition-all focus:outline-none focus:border-b-primary placeholder:text-grey-400"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white uppercase text-base rounded-full px-12 py-4 transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </div>
    </form>
  );
}

