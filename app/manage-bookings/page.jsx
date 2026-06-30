'use client';

import LoadingScreen from '@/components/LoadingScreen';
import SideNav from '@/components/SideNav';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function ManageBookingsPage() {
  const { user, isReady } = useAuthGuard();

  if (!isReady) return <LoadingScreen />;

  return (
    <main className="bg-grey-100 min-h-[60vh]">
      <div className="bg-white max-w-[120rem] mx-auto min-h-screen md:min-h-0 rounded-none md:rounded-sm overflow-hidden shadow-userview flex flex-col lg:flex-row">
        <SideNav active="settings" isAdmin={user.role === 'admin'} />

        <div className="flex-1 py-12 md:py-28">
          <div className="max-w-272 mx-auto px-6 md:px-16">
            <h1>Manage Bookings</h1>
          </div>
        </div>
      </div>
    </main>
  );
}