'use client';

import { X } from 'lucide-react';
import { useAlert } from '@/context/AlertContext';

export default function Alert() {
  const { alert, hideAlert } = useAlert();

  if (!alert) return null;

  const isSuccess = alert.type === 'success';

  return (
    <div
      role="alert"
      className={`fixed w-fit mx-auto mt-3 rounded-lg top-0 left-0 right-0 z-999999999 px-6 py-4 text-center text-white font-medium text-sm shadow-alert animate-move-in-bottom ${
        isSuccess ? 'bg-success' : 'bg-gradient-error'
      }`}
    >
      <span className="align-middle">{alert.message}</span>
      <button
        type="button"
        onClick={hideAlert}
        aria-label="Close"
        className="ms-4 align-middle inline-flex opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <X size={18} />
      </button>
    </div>
  );
}
