
import SignupForm from '@/components/SignupForm';
import GuestGuard from '@/components/GuestGuard';

export const metadata = { title: 'Create your account' };

export default function SignupPage() {
  return (
    <GuestGuard>
      <main className="bg-grey-100 min-h-[60vh] px-6 py-20">
        <div className="max-w-220 mx-auto bg-white shadow-login rounded-md px-6 sm:px-16 py-12 sm:py-20">
          <h2 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-10">
            Create your account!
          </h2>
          <SignupForm />
        </div>
      </main>
    </GuestGuard>
  );
}

