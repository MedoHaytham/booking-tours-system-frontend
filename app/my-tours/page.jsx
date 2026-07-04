'use client';

import { useGetMyToursQuery } from '@/features/bookingSlice';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import LoadingScreen from '@/components/LoadingScreen';
import SideNav from '@/components/SideNav';
import TourCard from '@/components/TourCard';
import TourCardLoading from '@/components/TourCardLoading';

export default function MyToursPage() {

  const { user, isReady } = useAuthGuard();
  
  const { data, isLoading, error } = useGetMyToursQuery();
  const tours = data?.data?.tours ?? [];
  
  if (!isReady) return <LoadingScreen />;

  return (
    <main className="bg-grey-100 min-h-[60vh]">
      <div className="bg-white max-w-[120rem] mx-auto min-h-screen md:min-h-0 rounded-none md:rounded-sm overflow-hidden shadow-userview flex flex-col lg:flex-row">
        <SideNav active="bookings" isAdmin={user.role === 'admin'} isLeadGuide={user.role === 'lead-guide'} />

        <div className="flex-1 py-12 md:py-20 px-6 md:px-12">
          <h2 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-10">
            My bookings
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
              <TourCardLoading length={3} />
            </div>
          ) : error ? (
            <p className="text-grey-500">
              Couldn&apos;t load your bookings ({error}). Check{' '}
              <code className="text-sm">ENDPOINTS.myTours</code> in{' '}
            </p>
          ) : tours.length === 0 ? (
            <p className="text-grey-500">You haven&apos;t booked any tours yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
              {tours.map((tour) => (
                <TourCard key={tour._id || tour.slug} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
