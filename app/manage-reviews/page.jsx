'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Trash2,
  Star,
  MessageSquare,
  Award,
  AlertTriangle,
  Calendar
} from 'lucide-react';

import LoadingScreen from '@/components/LoadingScreen';
import SideNav from '@/components/SideNav';
import StarRating from '@/components/StarRating';
import StatCard from '@/components/StatCard';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  useGetAllReviewsQuery,
  useGetReviewsStatsQuery,
  useDeleteReviewMutation,
} from '@/features/reviewSlice';
import { useAlert } from '@/context/AlertContext';
import ReviewTextCell from '@/components/ReviewTextCell';

export default function ManageReviewsPage() {
  const { user, isReady } = useAuthGuard();
  const router = useRouter();
  const { showAlert } = useAlert();

  // Enforce admin permission
  useEffect(() => {
    if (isReady && user && user.role !== 'admin') {
      showAlert('error', 'Unauthorized access.');
      router.push('/me');
    }
  }, [isReady, user, router, showAlert]);

  const [queryParams, setQueryParams] = useState({ page: 1, limit: 10, search: '', rating: '' });
  const [expandedReviews, setExpandedReviews] = useState({});

  const toggleExpand = (id) => {
    setExpandedReviews(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Fetch all reviews
  const { data: responseData, isLoading, error } = useGetAllReviewsQuery(
    {
      page: queryParams.page,
      limit: queryParams.limit,
      ...(queryParams.search && { search: queryParams.search }),
      ...(queryParams.rating && { rating: queryParams.rating }),
    },
    { skip: !isReady || user?.role !== 'admin' }
  );

  const reviews = useMemo(() => responseData?.data?.data || [], [responseData]);
  const total = responseData?.total || 0;
  const totalPages = Math.ceil(total / queryParams.limit) || 1;

  // Fetch stats
  const { data: statsData, isLoading: isStatsLoading } = useGetReviewsStatsQuery(undefined, {
    skip: !isReady || user?.role !== 'admin'
  });
  const stats = statsData?.data || {
    total: 0,
    avgRating: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0
  };

  const lowRatingsCount = (stats.oneStar || 0) + (stats.twoStars || 0);

  // Deletion State & Mutation
  const [deletingReview, setDeletingReview] = useState(null);
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const handleDeleteReview = async () => {
    if (!deletingReview) return;
    try {
      await deleteReview(deletingReview._id).unwrap();
      showAlert('success', 'Review deleted successfully!');
      setDeletingReview(null);
      
      // If we deleted the last item on the page, go to previous page
      if (reviews.length === 1 && queryParams.page > 1) {
        setQueryParams(prev => ({ ...prev, page: prev.page - 1 }));
      }
    } catch (err) {
      showAlert('error', err?.data?.message || 'Failed to delete review.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isReady || (user && user.role !== 'admin')) return <LoadingScreen />;

  return (
    <main className="bg-grey-100 min-h-[60vh]">
      <div className="bg-white max-w-[120rem] mx-auto min-h-screen md:min-h-0 rounded-none md:rounded-sm overflow-hidden shadow-userview flex flex-col lg:flex-row">
        <SideNav active="manage-reviews" isAdmin={user.role === 'admin'} />

        <div className="flex-1 min-w-0 py-12 px-4 sm:px-8 xl:px-16 animate-move-in-bottom">
          <div className="max-w-[100rem] mx-auto">
            {/* Header Title */}
            <div className="flex justify-between items-center mb-10 border-b border-grey-200 pb-5">
              <div>
                <h1 className="text-3xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide">
                  Manage Reviews
                </h1>
                <p className="text-sm text-grey-500 mt-1">
                  View, filter, search, and delete reviews submitted by users on tours.
                </p>
              </div>
            </div>

            {/* Quick Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <StatCard
                icon={<MessageSquare size={24} />}
                iconBg="bg-primary/10"
                iconColor="text-primary"
                label="Total Reviews"
                value={stats.total}
                isLoading={isStatsLoading}
              />

              <StatCard
                icon={<Star size={24} className="fill-amber-500" />}
                iconBg="bg-amber-100"
                iconColor="text-amber-500"
                label="Avg Rating"
                value={stats.avgRating ? stats.avgRating.toFixed(2) : '0.00'}
                isLoading={isStatsLoading}
              />

              <StatCard
                icon={<Award size={24} />}
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
                label="5-Star Ratings"
                value={stats.fiveStars}
                isLoading={isStatsLoading}
              />

              <StatCard
                icon={<AlertTriangle size={24} />}
                iconBg="bg-rose-100"
                iconColor="text-rose-600"
                label="Low Ratings (1-2★)"
                value={lowRatingsCount}
                isLoading={isStatsLoading}
              />
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between mb-8">
              <div className="relative w-full xl:w-80">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400" />
                <input
                  type="text"
                  placeholder="Search reviews content..."
                  value={queryParams.search}
                  onChange={(e) => setQueryParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-grey-100 border border-grey-200 focus:outline-none focus:border-primary text-sm transition-colors text-grey-700"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-start xl:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-grey-500 whitespace-nowrap">
                    Rating:
                  </span>
                  <select
                    value={queryParams.rating || 'all'}
                    onChange={(e) => setQueryParams(prev => ({ ...prev, rating: e.target.value === 'all' ? '' : e.target.value, page: 1 }))}
                    className="px-4 py-3 rounded-full bg-grey-100 border border-grey-200 text-sm text-grey-600 focus:outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reviews Data Grid/Table */}
            {isLoading ? (
              <div className="space-y-4 py-10">
                <div className="h-12 bg-grey-200 rounded-xl animate-pulse w-full"></div>
                <div className="h-16 bg-grey-200 rounded-xl animate-pulse w-full"></div>
                <div className="h-16 bg-grey-200 rounded-xl animate-pulse w-full"></div>
                <div className="h-16 bg-grey-200 rounded-xl animate-pulse w-full"></div>
              </div>
            ) : error ? (
              <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center shadow-sm">
                <p className="font-semibold text-lg">Error loading reviews</p>
                <p className="text-sm mt-1">{error?.data?.message || error?.message || 'Please try again later.'}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-grey-200 shadow-sm overflow-hidden">
                {/* Scrollable table area */}
                <div className="overflow-x-auto bg-white">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-grey-50 border-b border-grey-200">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Tour</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Reviewer</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Rating</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Review Text</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Created Date</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey-200">
                      {reviews.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-sm text-grey-500">
                            No reviews found matching your search criteria.
                          </td>
                        </tr>
                      ) : (
                        reviews.map((r) => {
                          const reviewerPhoto = r.user?.photo?.startsWith('http')
                            ? r.user.photo
                            : `/img/users/${r.user?.photo || 'default.jpg'}`;
                          return (
                            <tr key={r._id} className="hover:bg-grey-50/50 transition-colors">
                              {/* Tour Name */}
                              <td className="px-6 py-4 font-semibold text-sm text-grey-700 max-w-xs truncate">
                                {r.tour?.name || <span className="text-grey-400 italic">Deleted Tour</span>}
                              </td>

                              {/* User/Reviewer Profile */}
                              <td className="px-6 py-4 flex items-center gap-3">
                                <div className="relative w-10 h-10 shrink-0">
                                  <Image
                                    src={reviewerPhoto}
                                    alt={r.user?.name || 'Reviewer'}
                                    fill
                                    sizes="40px"
                                    className="rounded-full object-cover border border-grey-200"
                                  />
                                </div>
                                <span className="font-medium text-sm text-grey-700 truncate max-w-40">
                                  {r.user?.name || <span className="text-grey-400 italic">Deleted User</span>}
                                </span>
                              </td>

                              {/* Star Rating */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <StarRating rating={r.rating} size={15} />
                                  <span className="text-xs text-grey-500 font-bold">({r.rating})</span>
                                </div>
                              </td>

                              {/* Review Content */}
                              <td className="px-6 py-4 text-sm text-grey-600 max-w-sm">
                                <ReviewTextCell
                                  review={r.review}
                                  isExpanded={!!expandedReviews[r._id]}
                                  toggleExpand={() => toggleExpand(r._id)}
                                />
                              </td>

                              {/* Date */}
                              <td className="px-6 py-4 text-sm text-grey-500 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-grey-400" />
                                  {formatDate(r.createdAt)}
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setDeletingReview(r)}
                                  className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                                  title="Delete Review"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination — outside the scrollable area so it stays fixed */}
                {reviews.length > 0 && (() => {
                  const MAX_VISIBLE = 5;
                  const half = Math.floor(MAX_VISIBLE / 2);
                  let start = Math.max(1, queryParams.page - half);
                  let end = start + MAX_VISIBLE - 1;
                  if (end > totalPages) {
                    end = totalPages;
                    start = Math.max(1, end - MAX_VISIBLE + 1);
                  }
                  const pageRange = Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
                  return (
                    <div className="sticky bottom-0 z-10 px-6 py-4 bg-grey-50 border-t border-grey-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-grey-600">
                        Showing {((queryParams.page - 1) * queryParams.limit) + 1} to {Math.min(queryParams.page * queryParams.limit, total)} of {total} reviews
                      </p>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setQueryParams(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={queryParams.page === 1}
                          className="p-2 rounded-lg border border-grey-200 text-grey-600 hover:bg-grey-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed mr-1 font-semibold"
                          title="Previous Page"
                        >
                          &larr;
                        </button>

                        {start > 1 && (
                          <>
                            <button
                              onClick={() => setQueryParams(prev => ({ ...prev, page: 1 }))}
                              className="w-9 h-9 rounded-lg border border-grey-200 text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer text-grey-600 hover:bg-grey-100"
                            >
                              1
                            </button>
                            {start > 2 && <span className="text-grey-400 font-bold px-1">…</span>}
                          </>
                        )}

                        {pageRange.map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setQueryParams(prev => ({ ...prev, page: pageNum }))}
                            className={`w-9 h-9 rounded-lg border text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                              pageNum === queryParams.page
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'border-grey-200 text-grey-600 hover:bg-grey-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}

                        {end < totalPages && (
                          <>
                            {end < totalPages - 1 && <span className="text-grey-400 font-bold px-1">…</span>}
                            <button
                              onClick={() => setQueryParams(prev => ({ ...prev, page: totalPages }))}
                              className="w-9 h-9 rounded-lg border border-grey-200 text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer text-grey-600 hover:bg-grey-100"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setQueryParams(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={queryParams.page === totalPages}
                          className="p-2 rounded-lg border border-grey-200 text-grey-600 hover:bg-grey-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed ml-1 font-semibold"
                          title="Next Page"
                        >
                          &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-move-in-bottom">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="font-bold text-lg text-grey-700 mb-2">Delete Review</h3>
              <p className="text-sm text-grey-500 mb-6 px-4">
                Are you sure you want to delete this review by <strong>{deletingReview.user?.name || 'Deleted User'}</strong> on <strong>{deletingReview.tour?.name || 'Deleted Tour'}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-center w-full">
                <button
                  type="button"
                  onClick={() => setDeletingReview(null)}
                  className="flex-1 py-3 rounded-full border border-grey-200 hover:bg-grey-50 text-sm text-grey-600 transition-colors cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-sm text-white font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}