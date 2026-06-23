"use client";

import TourCard from "@/components/TourCard";
import { useGetAllToursQuery } from "@/features/tourSlice";

export default function OverviewPage() {
  const { data, isLoading, error } = useGetAllToursQuery();
  const tours = data?.data?.data ?? [];

  if (isLoading) {
    return (
      <main className="bg-grey-100 min-h-[60vh] px-6 lg:px-[60px] py-20">
        <div className="max-w-300 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[70px]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden shadow-card">
              <div className="skeleton h-52 w-full" />
              <div className="p-6 space-y-4">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-5/6 rounded" />
                <div className="flex justify-between pt-2">
                  <div className="skeleton h-4 w-20 rounded" />
                  <div className="skeleton h-4 w-20 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="bg-grey-100 min-h-[60vh] px-6 lg:px-[60px] py-20">
      {error ? (
        <p className="max-w-xl mx-auto text-center text-grey-500">
          Couldn&apos;t load tours from the API. Make sure{" "}
          <code className="text-sm">API_BASE_URL</code> in{" "}
          <code>.env.local</code> points at your backend.
        </p>
      ) : tours.length === 0 ? (
        <p className="text-center text-grey-500">No tours found.</p>
      ) : (
        <div className="max-w-300 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[70px]">
          {tours.map((tour) => (
            <TourCard key={tour._id || tour.slug} tour={tour} />
          ))}
        </div>
      )}
    </main>
  );
}
