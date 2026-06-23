/**
 * Full-screen splash shown while AuthContext is checking whether there's
 * a valid session (status === 'loading'). Pass fadeOut once the check
 * resolves so it transitions out smoothly instead of popping away.
 */

import Image from 'next/image';

export default function LoadingScreen({ fadeOut = false }) {
  return (
    <div
      aria-hidden={fadeOut}
      className={`fixed inset-0 z-999999999999 flex flex-col items-center justify-center gap-6 bg-white transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex h-32 w-32 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-grey-200 border-t-primary animate-spin" />
        <Image
          src="/img/logo-green-small.png"
          alt="Natours Logo"
          width={68}
          height={35}
          className="h-9 logo-fade"
        />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-grey-500">
        Loading
      </p>
    </div>
  );
}
