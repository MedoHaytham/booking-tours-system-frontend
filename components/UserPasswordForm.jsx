'use client';

import { useState } from 'react';
import { useUpdateMyPasswordMutation } from '@/features/userSlice';
import { useAlert } from '@/context/AlertContext';

export default function UserPasswordForm() {
  const [updateMyPassword, { isLoading: loading }] = useUpdateMyPasswordMutation();
  const { showAlert } = useAlert();

  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMyPassword({
        currentPassword: passwordCurrent,
        newPassword: password,
        confirmNewPassword: passwordConfirm
      }).unwrap();
      showAlert('success', 'Password updated successfully!');
      setPasswordCurrent('');
      setPassword('');
      setPasswordConfirm('');
    } catch (err) {
      showAlert('error', err?.data?.message || err?.message || 'Could not update password.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div>
        <label htmlFor="password-current" className="block text-base font-bold mb-2">
          Current password
        </label>
        <input
          id="password-current"
          type="password"
          required
          minLength={8}
          value={passwordCurrent}
          onChange={(e) => setPasswordCurrent(e.target.value)}
          placeholder="••••••••"
          className="block w-full rounded-[4px] bg-grey-200 border-t-[3px] border-b-[3px] border-transparent px-7 py-5 text-sm transition-all focus:outline-none focus:border-b-primary placeholder:text-grey-400"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-base font-bold mb-2">
          New password
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
        <label htmlFor="password-confirm" className="block text-base font-bold mb-2">
          Confirm password
        </label>
        <input
          id="password-confirm"
          type="password"
          required
          minLength={8}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="••••••••"
          className="block w-full rounded-[4px] bg-grey-200 border-t-[3px] border-b-[3px] border-transparent px-7 py-5 text-sm transition-all focus:outline-none focus:border-b-primary placeholder:text-grey-400"
        />
      </div>

      <div className="text-right">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white uppercase text-sm rounded-full px-10 py-4 transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Saving…' : 'Save password'}
        </button>
      </div>
    </form>
  );
}

