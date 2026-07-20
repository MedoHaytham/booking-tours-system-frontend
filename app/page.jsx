"use client";

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import TourCard from "@/components/TourCard";
import TourCardLoading from "@/components/TourCardLoading";
import PaginationControls from "@/components/PaginationControls";
import { useGetAllToursQuery } from "@/features/tourSlice";

const LIMIT = 9;

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All Difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'difficult', label: 'Difficult' },
];

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'All Tours' },
  { value: 'true', label: 'Available' },
  { value: 'false', label: 'Sold Out' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-ratingsAverage', label: 'Top Rated' },
];

export default function OverviewPage() {
  const [queryParams, setQueryParams] = useState({
    page: 1,
    search: '',
    difficulty: '',
    available: '',
    sort: '-createdAt',
  });

  const setParam = (key, value) =>
    setQueryParams(prev => ({ ...prev, [key]: value, page: 1 }));

  const { data, isLoading, error } = useGetAllToursQuery({
    page: queryParams.page,
    limit: LIMIT,
    ...(queryParams.search && { search: queryParams.search }),
    ...(queryParams.difficulty && { difficulty: queryParams.difficulty }),
    ...(queryParams.available !== '' && { available: queryParams.available }),
    sort: queryParams.sort,
  });

  const tours = useMemo(() => data?.data?.data ?? [], [data]);
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT) || 1;

  const hasActiveFilters =
    queryParams.search || queryParams.difficulty || queryParams.available !== '';

  return (
    <main className="bg-grey-100 min-h-[60vh]">

      {/* ── Filter / Search Bar ── */}
      <div className="bg-white border-b border-grey-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[120rem] mx-auto px-6 lg:px-15 py-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-0 max-w-sm">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search tours…"
              value={queryParams.search}
              onChange={e => setParam('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-grey-100 border border-grey-200 focus:outline-none focus:border-primary text-sm text-grey-700 transition-colors"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-3">

            {/* Difficulty */}
            <div className="relative">
              <select
                value={queryParams.difficulty}
                onChange={e => setParam('difficulty', e.target.value)}
                className="appearance-none pl-4 pr-8 py-2.5 rounded-full bg-grey-100 border border-grey-200 text-sm text-grey-600 focus:outline-none focus:border-primary cursor-pointer font-medium transition-colors"
              >
                {DIFFICULTY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 pointer-events-none" />
            </div>

            {/* Availability */}
            <div className="relative">
              <select
                value={queryParams.available}
                onChange={e => setParam('available', e.target.value)}
                className="appearance-none pl-4 pr-8 py-2.5 rounded-full bg-grey-100 border border-grey-200 text-sm text-grey-600 focus:outline-none focus:border-primary cursor-pointer font-medium transition-colors"
              >
                {AVAILABILITY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={queryParams.sort}
                onChange={e => setParam('sort', e.target.value)}
                className="appearance-none pl-4 pr-8 py-2.5 rounded-full bg-grey-100 border border-grey-200 text-sm text-grey-600 focus:outline-none focus:border-primary cursor-pointer font-medium transition-colors"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 pointer-events-none" />
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={() => setQueryParams({ page: 1, search: '', difficulty: '', available: '', sort: queryParams.sort })}
                className="px-4 py-2.5 rounded-full border border-grey-300 text-xs font-bold uppercase tracking-wider text-grey-500 hover:bg-grey-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results count */}
          {!isLoading && (
            <span className="ml-auto text-xs text-grey-400 font-semibold whitespace-nowrap hidden lg:block">
              {total} tour{total !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="min-h-[69vh] flex flex-col justify-center items-center px-6 lg:px-15 py-16">
        {/* Loading skeletons */}
        {isLoading ? (
          <div className="max-w-300 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-17.5">
            <TourCardLoading length={3} isHome={true}/>
          </div>
        ) : error ? (
          <p className="max-w-xl mx-auto text-center text-grey-500">
            Couldn&apos;t load tours from the API. Make sure{" "}
            <code className="text-sm">API_BASE_URL</code> in{" "}
            <code>.env.local</code> points at your backend.
          </p>
        ) : tours.length === 0 ? (
          <div className="max-w-xl mx-auto text-center py-16">
            <SlidersHorizontal size={40} className="mx-auto text-grey-300 mb-4" />
            <p className="text-grey-500 font-medium">No tours match your filters.</p>
            <button
              onClick={() => setQueryParams({ page: 1, search: '', difficulty: '', available: '', sort: '-createdAt' })}
              className="mt-4 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <>
            <div className="max-w-300 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-17.5">
              {tours.map((tour) => (
                <TourCard key={tour._id || tour.slug} tour={tour} />
              ))}
            </div>

            <div className="w-full 2xl:w-[69%] mx-auto mt-12">
              <div className="rounded-xl border border-grey-200 shadow-sm overflow-hidden bg-white">
                <PaginationControls
                  page={queryParams.page}
                  totalPages={totalPages}
                  total={total}
                  limit={LIMIT}
                  label="tours"
                  onChange={(newPage) => setQueryParams(p => ({ ...p, page: newPage }))}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
