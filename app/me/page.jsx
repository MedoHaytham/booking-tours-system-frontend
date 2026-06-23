'use client';

import LoadingScreen from '@/components/LoadingScreen';
import SideNav from '@/components/SideNav';
import UserDataForm from '@/components/UserDataForm';
import UserPasswordForm from '@/components/UserPasswordForm';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function AccountPage() {
  const { user, isReady } = useAuthGuard();

  if (!isReady) return <LoadingScreen />;

  return (
    <main className="bg-grey-100 min-h-[60vh] px-0 py-0 md:px-12 md:py-20">
      <div className="bg-white max-w-[120rem] mx-auto min-h-screen md:min-h-0 rounded-none md:rounded-sm overflow-hidden shadow-userview flex flex-col md:flex-row">
        <SideNav active="settings" isAdmin={user.role === 'admin'} />

        <div className="flex-1 py-12 md:py-28">
          <div className="max-w-272 mx-auto px-6 md:px-16">
            <h2 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-8">
              Your account settings
            </h2>
            <UserDataForm key={user._id} user={user} />

            <div className="my-16 h-px w-full bg-grey-300" />

            <h2 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-8">
              Password change
            </h2>
            <UserPasswordForm />
          </div>
        </div>
      </div>
    </main>
  );
}

