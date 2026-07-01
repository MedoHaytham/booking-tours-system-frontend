'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Edit,
  Trash2,
  X,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';

import LoadingScreen from '@/components/LoadingScreen';
import SideNav from '@/components/SideNav';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  useGetAllBookingsQuery,
  useGetBookingsStatsQuery,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} from '@/features/bookingSlice';
import { useAlert } from '@/context/AlertContext';

export default function ManageBookingsPage() {
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

  const [queryParams, setQueryParams] = useState({ page: 1, limit: 10, paid: '', search: '' });

  // Fetch paginated bookings from backend
  const { data: responseData, isLoading, error } = useGetAllBookingsQuery(
    {
      page: queryParams.page,
      limit: queryParams.limit,
      ...(queryParams.paid !== '' && { paid: queryParams.paid }),
      ...(queryParams.search && { search: queryParams.search }),
    },
    { skip: !isReady || user?.role !== 'admin' }
  );

  const bookings = useMemo(() => responseData?.data?.data || [], [responseData]);
  const total = responseData?.total || 0;
  const totalPages = Math.ceil(total / queryParams.limit) || 1;

  // Fetch bookings statistics
  const { data: statsData, isLoading: isStatsLoading } = useGetBookingsStatsQuery(undefined, {
    skip: !isReady || user?.role !== 'admin'
  });
  const stats = statsData?.data || {
    totalBookings: 0,
    totalRevenue: 0,
    paidBookings: 0,
    unpaidBookings: 0
  };

  // Mutations
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();

  // Modal States
  const [editingBooking, setEditingBooking] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editPaid, setEditPaid] = useState(true);
  const [editDate, setEditDate] = useState('');

  const [deletingBooking, setDeletingBooking] = useState(null);

  // Handlers
  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setEditPrice(booking.price);
    setEditPaid(booking.paid);
    setEditDate(booking.date ? new Date(booking.date).toISOString().split('T')[0] : '');
  };

  const handleUpdateBooking = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    try {
      await updateBooking({
        id: editingBooking._id,
        body: {
          price: Number(editPrice),
          paid: editPaid,
          date: editDate ? new Date(editDate) : editingBooking.date,
        },
      }).unwrap();
      showAlert('success', 'Booking details updated successfully!');
      setEditingBooking(null);
    } catch (err) {
      showAlert('error', err?.data?.message || 'Failed to update booking details.');
    }
  };

  const handleDeleteBooking = async () => {
    if (!deletingBooking) return;
    try {
      await deleteBooking(deletingBooking._id).unwrap();
      showAlert('success', 'Booking deleted successfully!');
      setDeletingBooking(null);

      // Adjust page if we deleted the last item on the page
      if (bookings.length === 1 && queryParams.page > 1) {
        setQueryParams((prev) => ({ ...prev, page: prev.page - 1 }));
      }
    } catch (err) {
      showAlert('error', err?.data?.message || 'Failed to delete booking.');
    }
  };

  // Helpers
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
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
        <SideNav active="manage-bookings" isAdmin={user.role === 'admin'} />

        <div className="flex-1 min-w-0 py-12 px-4 sm:px-8 xl:px-16 animate-move-in-bottom">
          <div className="max-w-[100rem] mx-auto">
            
            {/* Header section */}
            <div className="flex justify-between items-center mb-10 border-b border-grey-200 pb-5">
              <div>
                <h1 className="text-3xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide">
                  Manage Bookings
                </h1>
                <p className="text-sm text-grey-500 mt-1">
                  View tour reservations, adjust prices, edit payment status, or remove bookings.
                </p>
              </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              {/* Total Bookings */}
              <div className="bg-grey-100 p-6 rounded-xl border border-grey-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <p className="text-xs text-grey-500 font-bold uppercase tracking-wider">Total Bookings</p>
                  <h3 className="text-2xl font-bold text-grey-700">
                    {isStatsLoading ? '...' : stats.totalBookings}
                  </h3>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-grey-100 p-6 rounded-xl border border-grey-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs text-grey-500 font-bold uppercase tracking-wider">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-grey-700">
                    {isStatsLoading ? '...' : formatPrice(stats.totalRevenue)}
                  </h3>
                </div>
              </div>

              {/* Paid Bookings */}
              <div className="bg-grey-100 p-6 rounded-xl border border-grey-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs text-grey-500 font-bold uppercase tracking-wider">Paid Bookings</p>
                  <h3 className="text-2xl font-bold text-grey-700">
                    {isStatsLoading ? '...' : stats.paidBookings}
                  </h3>
                </div>
              </div>

              {/* Unpaid Bookings */}
              <div className="bg-grey-100 p-6 rounded-xl border border-grey-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <XCircle size={24} />
                </div>
                <div>
                  <p className="text-xs text-grey-500 font-bold uppercase tracking-wider">Unpaid Bookings</p>
                  <h3 className="text-2xl font-bold text-grey-700">
                    {isStatsLoading ? '...' : stats.unpaidBookings}
                  </h3>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between mb-8">
              <div className="relative w-full xl:w-96">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400" />
                <input
                  type="text"
                  placeholder="Search by tour name, user name, or email..."
                  value={queryParams.search}
                  onChange={(e) => setQueryParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-grey-100 border border-grey-200 focus:outline-none focus:border-primary text-sm transition-colors text-grey-700"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-start xl:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-grey-500 whitespace-nowrap">
                    Payment Status:
                  </span>
                  <select
                    value={queryParams.paid}
                    onChange={(e) => {
                      setQueryParams((prev) => ({ ...prev, paid: e.target.value, page: 1 }));
                    }}
                    className="px-4 py-3 rounded-full bg-grey-100 border border-grey-200 text-sm text-grey-600 focus:outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="">All Bookings</option>
                    <option value="true">Paid Only</option>
                    <option value="false">Unpaid Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bookings Table / Grid */}
            {isLoading ? (
              <div className="space-y-4 py-10">
                <div className="h-12 bg-grey-200 rounded-xl animate-pulse w-full"></div>
                <div className="h-16 bg-grey-200 rounded-xl animate-pulse w-full"></div>
                <div className="h-16 bg-grey-200 rounded-xl animate-pulse w-full"></div>
                <div className="h-16 bg-grey-200 rounded-xl animate-pulse w-full"></div>
              </div>
            ) : error ? (
              <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center shadow-sm">
                <p className="font-semibold text-lg">Error loading bookings</p>
                <p className="text-sm mt-1">
                  {error?.data?.message || error?.message || 'Please try again later.'}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-grey-200 shadow-sm overflow-hidden bg-white">
                {/* Responsive container for table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-grey-50 border-b border-grey-200">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Tour</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Customer</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Price</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Tour Date</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Session ID</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey-200">
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-10 text-center text-sm text-grey-500">
                            No bookings found.
                          </td>
                        </tr>
                      ) : (
                        bookings.map((b) => {
                          const customerPhoto = b.user?.photo?.startsWith('http')
                            ? b.user.photo
                            : `/img/users/${b.user?.photo || 'default.jpg'}`;
                          return (
                            <tr key={b._id} className="hover:bg-grey-50/50 transition-colors">
                              {/* Tour Name */}
                              <td className="px-6 py-4 font-semibold text-sm text-grey-700 max-w-[200px] truncate">
                                {b.tour?.name || <span className="text-grey-400 italic">Deleted Tour</span>}
                              </td>

                              {/* Customer Profile */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-10 h-10 shrink-0">
                                    <Image
                                      src={customerPhoto}
                                      alt={b.user?.name || 'Customer'}
                                      fill
                                      sizes="40px"
                                      className="rounded-full object-cover border border-grey-200"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm text-grey-700 truncate max-w-[150px]">
                                      {b.user?.name || <span className="text-grey-400 italic font-normal">Deleted User</span>}
                                    </p>
                                    <p className="text-xs text-grey-500 truncate max-w-[180px]">
                                      {b.user?.email || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Price */}
                              <td className="px-6 py-4 text-sm font-semibold text-grey-700 whitespace-nowrap">
                                {formatPrice(b.price)}
                              </td>

                              {/* Date */}
                              <td className="px-6 py-4 text-sm text-grey-600 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-grey-400" />
                                  {formatDate(b.date)}
                                </div>
                              </td>

                              {/* Session ID */}
                              <td className="px-6 py-4 text-xs font-mono text-grey-500 max-w-[150px] truncate" title={b.sessionId}>
                                {b.sessionId || 'N/A'}
                              </td>

                              {/* Status Badge */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                    b.paid
                                      ? 'bg-green-50 text-green-700 border-green-200'
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}
                                >
                                  {b.paid ? 'Paid' : 'Unpaid'}
                                </span>
                              </td>

                              {/* Action Buttons */}
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    onClick={() => handleEditClick(b)}
                                    className="p-2 rounded-full hover:bg-grey-100 text-primary transition-colors cursor-pointer"
                                    title="Edit Booking"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => setDeletingBooking(b)}
                                    className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                                    title="Delete Booking"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Sticky Pagination Bar */}
                {total > 0 && (() => {
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
                        Showing {((queryParams.page - 1) * queryParams.limit) + 1} to{' '}
                        {Math.min(queryParams.page * queryParams.limit, total)} of {total} bookings
                      </p>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setQueryParams((prev) => ({ ...prev, page: prev.page - 1 }))}
                          disabled={queryParams.page === 1}
                          className="p-2 rounded-lg border border-grey-200 text-grey-600 hover:bg-grey-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed mr-1 font-semibold"
                          title="Previous Page"
                        >
                          &larr;
                        </button>

                        {start > 1 && (
                          <>
                            <button
                              onClick={() => setQueryParams((prev) => ({ ...prev, page: 1 }))}
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
                            onClick={() => setQueryParams((prev) => ({ ...prev, page: pageNum }))}
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
                              onClick={() => setQueryParams((prev) => ({ ...prev, page: totalPages }))}
                              className="w-9 h-9 rounded-lg border border-grey-200 text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer text-grey-600 hover:bg-grey-100"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setQueryParams((prev) => ({ ...prev, page: prev.page + 1 }))}
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

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-move-in-bottom border border-grey-200">
            <div className="px-6 py-5 border-b border-grey-200 flex items-center justify-between bg-grey-50">
              <h3 className="font-bold text-lg text-grey-700">Edit Booking Details</h3>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-grey-400 hover:text-grey-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateBooking} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-2">
                  Tour & Customer
                </label>
                <div className="bg-grey-100 p-4 rounded-xl border border-grey-200 space-y-2">
                  <p className="text-sm font-bold text-grey-700">
                    <span className="text-grey-400 font-semibold uppercase text-xs block">Tour</span>
                    {editingBooking.tour?.name || 'Deleted Tour'}
                  </p>
                  <div className="border-t border-grey-200/60 my-2"></div>
                  <div className="flex items-center gap-3">
                    <Image
                      src={
                        editingBooking.user?.photo?.startsWith('http')
                          ? editingBooking.user.photo
                          : `/img/users/${editingBooking.user?.photo || 'default.jpg'}`
                      }
                      alt={editingBooking.user?.name || 'Customer'}
                      width={36}
                      height={36}
                      className="rounded-full object-cover border border-grey-200"
                    />
                    <div>
                      <p className="font-semibold text-sm text-grey-700">
                        {editingBooking.user?.name || 'Deleted User'}
                      </p>
                      <p className="text-xs text-grey-500">{editingBooking.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price input */}
              <div>
                <label htmlFor="edit-price" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-2">
                  Price ($)
                </label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400" />
                  <input
                    id="edit-price"
                    type="number"
                    required
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>

              {/* Date input */}
              <div>
                <label htmlFor="edit-date" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-2">
                  Tour Date
                </label>
                <div className="relative">
                  <input
                    id="edit-date"
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium cursor-pointer"
                  />
                </div>
              </div>

              {/* Paid Status Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-2">
                  Payment Status
                </label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-grey-200 bg-grey-50 cursor-pointer hover:bg-grey-100/50 transition-colors">
                    <input
                      type="radio"
                      name="paid-status"
                      checked={editPaid === true}
                      onChange={() => setEditPaid(true)}
                      className="accent-primary cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-grey-700">Paid</span>
                  </label>

                  <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-grey-200 bg-grey-50 cursor-pointer hover:bg-grey-100/50 transition-colors">
                    <input
                      type="radio"
                      name="paid-status"
                      checked={editPaid === false}
                      onChange={() => setEditPaid(false)}
                      className="accent-rose-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-grey-700 text-rose-600">Unpaid</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-grey-100">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-5 py-3 rounded-full border border-grey-200 hover:bg-grey-50 text-sm text-grey-600 transition-colors cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-3 rounded-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-sm text-white font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-move-in-bottom">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-bold text-lg text-grey-700 mb-2">Delete Tour Reservation</h3>
              <p className="text-sm text-grey-500 mb-6 px-4">
                Are you sure you want to delete the booking for <strong>{deletingBooking.tour?.name || 'Deleted Tour'}</strong> booked by{' '}
                <strong>{deletingBooking.user?.name || 'Deleted User'}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-center w-full">
                <button
                  type="button"
                  onClick={() => setDeletingBooking(null)}
                  className="flex-1 py-3 rounded-full border border-grey-200 hover:bg-grey-50 text-sm text-grey-600 transition-colors cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteBooking}
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