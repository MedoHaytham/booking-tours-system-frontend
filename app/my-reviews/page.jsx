'use client';

import { useGetMyReviewsQuery } from "@/features/reviewSlice";
import { useAuthGuard } from '@/hooks/useAuthGuard';
import LoadingScreen from '@/components/LoadingScreen';
import SideNav from '@/components/SideNav';
import ReviewCard from "@/components/ReviewCard";

export default function MyReviews() {

  const { user, isReady } = useAuthGuard();
    
  const { data, isLoading, error } = useGetMyReviewsQuery();
  const reviews = data?.data?.reviews ?? [];
    
  if (!isReady) return <LoadingScreen />;

  return (
    <main className="bg-grey-100 min-h-[77vh]">
      <div className="bg-white max-w-[120rem] mx-auto min-h-screen md:min-h-0 rounded-none md:rounded-sm overflow-hidden shadow-userview flex flex-col lg:flex-row">
        <SideNav active="reviews" isAdmin={user.role === 'admin'} isLeadGuide={user.role === 'lead-guide'} />

        <div className="flex-1 py-12 md:py-20 px-6 md:px-12">
          <h2 className="text-2xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide mb-10">
            My reviews
          </h2>

          {true ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="overflow-hidden shadow-card">
                  <div className="w-full flex justify-between items-center p-5">
                    <div className="skeleton h-7 w-50 rounded-sm" />
                    <div className="skeleton h-5 w-12 rounded-sm" />
                  </div>
                  <div className="p-5 space-y-8">
                    <div className="skeleton h-22 w-full rounded-sm" />
                    <div className="skeleton h-5 w-20 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-grey-500">
              Couldn&apos;t load your reviews ({error?.data?.message ?? error?.status ?? 'Unknown error'}). Check{' '}
              <code className="text-sm">ENDPOINTS.myReviews</code> in{' '}
            </p>
          ) : reviews.length === 0 ? (
            <p className="text-grey-500">You haven&apos;t reviewed any tours yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-10">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} myReview={true} hideUser className="w-full" />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}