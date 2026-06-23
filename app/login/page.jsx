
import LoginForm from '@/components/LoginForm';
import GuestGuard from '@/components/GuestGuard';

export const metadata = { title: 'Log into your account' };

export default function LoginPage() {
  return (
    <GuestGuard>
      <main className="bg-grey-100 min-h-[60vh] px-6 py-20">
        <div className="max-w-220 mx-auto bg-white shadow-login rounded-md px-6 sm:px-16 py-12 sm:py-20">
          <h2 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-10">
            Log into your account
          </h2>
          <LoginForm />
        </div>
      </main>
    </GuestGuard>
  );
}

