'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import {
  Search,
  Edit,
  Trash2,
  X,
  Star,
  Map,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  BarChart2,
  CheckCircle2,
  XCircle,
  Plus,
  ImagePlus,
  Upload,
} from 'lucide-react';

import LoadingScreen from '@/components/LoadingScreen';
import SideNav from '@/components/SideNav';
import StatCard from '@/components/StatCard';
import StartDatesManager from '@/components/StartDatesManager';
import GuidesSelector from '@/components/GuidesSelector';
import WaypointsManager from '@/components/WaypointsManager';
import StartLocationForm from '@/components/StartLocationForm';
import ImageUploadField from '@/components/ImageUploadField';
import SortIcon from '@/components/SortIcon';

import {
  useGetAllToursQuery,
  useCreateTourMutation,
  useDeleteTourMutation,
  useUpdateTourMutation,
  useGetTourStatsQuery,
} from '@/features/tourSlice';
import { useGetAllUsersQuery } from '@/features/userSlice';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAlert } from '@/context/AlertContext';

const DIFFICULTY_STYLES = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  difficult: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function ManageToursPage() {
  const { user, isReady } = useAuthGuard();
  const router = useRouter();
  const { showAlert } = useAlert();

  // Enforce admin / lead-guide permission
  useEffect(() => {
    if (isReady && user && user.role !== 'admin' && user.role !== 'lead-guide') {
      showAlert('error', 'Unauthorized access.');
      router.push('/me');
    }
  }, [isReady, user, router, showAlert]);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    difficulty: '',
    available: '',
    sort: '-createdAt',
  });

  // Fetch paginated tours from backend
  const { data: responseData, isLoading, error } = useGetAllToursQuery(
    {
      page: queryParams.page,
      limit: queryParams.limit,
      ...(queryParams.search && { search: queryParams.search }),
      ...(queryParams.difficulty && { difficulty: queryParams.difficulty }),
      ...(queryParams.available !== '' && { available: queryParams.available }),
      sort: queryParams.sort,
    },
    { skip: !isReady || (user?.role !== 'admin' && user?.role !== 'lead-guide') }
  );

  const tours = useMemo(() => responseData?.data?.data || [], [responseData]);
  const total = responseData?.total || 0;
  const totalPages = Math.ceil(total / queryParams.limit) || 1;

  // Fetch overall stats from backend
  const { data: statsData, isLoading: isLoadingStats } = useGetTourStatsQuery(
    undefined,
    { skip: !isReady || (user?.role !== 'admin' && user?.role !== 'lead-guide') }
  );

  const stats = useMemo(() => {
    return statsData?.data?.stats?.[0] || { avgRating: 0, avgPrice: 0, numAvailableTours: 0, numSoldOut: 0 };
  }, [statsData]);

  // Fetch all users to select guides from
  const { data: usersData } = useGetAllUsersQuery(
    { limit: 1000 },
    { skip: !isReady || (user?.role !== 'admin' && user?.role !== 'lead-guide') }
  );

  const guidesList = useMemo(() => {
    return usersData?.data?.data?.filter(u => u.role === 'guide' || u.role === 'lead-guide') || [];
  }, [usersData]);

  // Mutations
  const [createTour, { isLoading: isCreating }] = useCreateTourMutation();
  const [deleteTour, { isLoading: isDeleting }] = useDeleteTourMutation();
  const [updateTour, { isLoading: isUpdating }] = useUpdateTourMutation();

  // ── Modal States ────────────────────────────────────────────────────────────
  const [deletingTour, setDeletingTour] = useState(null);
  const [editingTour, setEditingTour] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState([]);
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editImagesPreview, setEditImagesPreview] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const EMPTY_CREATE = {
    name: '', price: '', duration: '', maxGroupSize: '',
    difficulty: 'easy', summary: '', description: '',
    startDates: [],
    guides: [],
    startLocation: { description: '', address: '', coordinates: [0, 0] },
    locations: [],
  };
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [createCoverFile, setCreateCoverFile] = useState(null);
  const [createCoverPreview, setCreateCoverPreview] = useState([]);
  const [createImageFiles, setCreateImageFiles] = useState([]);
  const [createImagesPreview, setCreateImagesPreview] = useState([]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const formatPrice = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

  const getCoverSrc = (t) => {
    const img = t.imageCover || '';
    if (img.startsWith('http')) return img;
    return `/img/tours/${img}`;
  };

  const filesToPreview = (files) => Array.from(files).map((f) => URL.createObjectURL(f));

  // ── Edit Handlers ───────────────────────────────────────────────────────────
  const handleEditClick = (tour) => {
    setEditingTour(tour);
    setEditForm({
      name: tour.name || '',
      price: tour.price || '',
      duration: tour.duration || '',
      maxGroupSize: tour.maxGroupSize || '',
      difficulty: tour.difficulty || 'easy',
      summary: tour.summary || '',
      startDates: tour.startDates ? tour.startDates.map(d => ({
        _id: d._id,
        startDate: d.startDate,
        soldOut: d.soldOut,
        participants: d.participants
      })) : [],
      startLocation: tour.startLocation ? {
        description: tour.startLocation.description || '',
        address: tour.startLocation.address || '',
        coordinates: tour.startLocation.coordinates ? [...tour.startLocation.coordinates] : [0, 0]
      } : { description: '', address: '', coordinates: [0, 0] },
      locations: tour.locations ? tour.locations.map(loc => ({
        description: loc.description || '',
        address: loc.address || '',
        coordinates: loc.coordinates ? [...loc.coordinates] : [0, 0],
        day: loc.day || 1
      })) : [],
      guides: tour.guides ? tour.guides.map(g => g._id || g) : [],
      description: tour.description || '',
    });
    setEditCoverFile(null);
    setEditCoverPreview(tour.imageCover ? [getCoverSrc(tour)] : []);
    setEditImageFiles([]);
    setEditImagesPreview(tour.images?.map((img) => (img.startsWith('http') ? img : `/img/tours/${img}`)) || []);
  };

  const handleEditCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditCoverFile(file);
    setEditCoverPreview([URL.createObjectURL(file)]);
  };

  const handleEditImagesChange = (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setEditImageFiles(Array.from(files));
    setEditImagesPreview(filesToPreview(files));
  };

  const sanitizeLocations = (form) => {
    const startLocation = form.startLocation ? {
      type: 'Point',
      description: form.startLocation.description || '',
      address: form.startLocation.address || '',
      coordinates: [
        Number(form.startLocation.coordinates?.[0] || 0), // longitude
        Number(form.startLocation.coordinates?.[1] || 0), // latitude
      ]
    } : { type: 'Point', description: '', address: '', coordinates: [0, 0] };

    const locations = form.locations ? form.locations.map(loc => ({
      type: 'Point',
      coordinates: [
        Number(loc.coordinates?.[0] || 0), // longitude
        Number(loc.coordinates?.[1] || 0), // latitude
      ],
      address: loc.address || '',
      description: loc.description || '',
      day: Number(loc.day || 1)
    })) : [];

    return { startLocation, locations };
  };

  const handleUpdateTour = async (e) => {
    e.preventDefault();
    if (!editingTour) return;
    if (!editForm.startDates || editForm.startDates.length === 0) {
      showAlert('error', 'You must have at least one start date.');
      return;
    }
    const duration = Number(editForm.duration);
    if (editForm.locations && editForm.locations.length > 0) {
      const invalidLoc = editForm.locations.find(loc => Number(loc.day) > duration || Number(loc.day) < 1);
      if (invalidLoc) {
        showAlert('error', `Location "${invalidLoc.description || 'unnamed'}" has Day ${invalidLoc.day} which exceeds the tour duration of ${duration} day(s). Please fix it before saving.`);
        return;
      }
    }
    try {
      const { startLocation, locations } = sanitizeLocations(editForm);
      // First, update the metadata and start dates as JSON
      const jsonBody = {
        ...editForm,
        price: Number(editForm.price),
        duration: Number(editForm.duration),
        maxGroupSize: Number(editForm.maxGroupSize),
        startLocation,
        locations
      };
      await updateTour({ id: editingTour._id, body: jsonBody }).unwrap();

      // Second, if there are files, update the files via FormData
      if (editCoverFile || editImageFiles.length > 0) {
        const fd = new FormData();
        if (editCoverFile) fd.append('imageCover', editCoverFile);
        editImageFiles.forEach((f) => fd.append('images', f));
        await updateTour({ id: editingTour._id, body: fd }).unwrap();
      }

      showAlert('success', 'Tour updated successfully!');
      setEditingTour(null);
    } catch (err) {
      showAlert('error', err?.data?.message || 'Failed to update tour.');
    }
  };

  // ── Create Handlers ─────────────────────────────────────────────────────────
  const handleCreateCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCreateCoverFile(file);
    setCreateCoverPreview([URL.createObjectURL(file)]);
  };

  const handleCreateImagesChange = (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setCreateImageFiles(Array.from(files));
    setCreateImagesPreview(filesToPreview(files));
  };

  const handleCreateTour = async (e) => {
    e.preventDefault();
    if (!createForm.startDates || createForm.startDates.length === 0) {
      showAlert('error', 'You must add at least one start date.');
      return;
    }
    const duration = Number(createForm.duration);
    if (createForm.locations && createForm.locations.length > 0) {
      const invalidLoc = createForm.locations.find(loc => Number(loc.day) > duration || Number(loc.day) < 1);
      if (invalidLoc) {
        showAlert('error', `Location "${invalidLoc.description || 'unnamed'}" has Day ${invalidLoc.day} which exceeds the tour duration of ${duration} day(s). Please fix it before saving.`);
        return;
      }
    }
    try {
      const { startLocation, locations } = sanitizeLocations(createForm);
      // First, create the tour via JSON containing all metadata and start dates
      const jsonBody = {
        ...createForm,
        price: Number(createForm.price),
        duration: Number(createForm.duration),
        maxGroupSize: Number(createForm.maxGroupSize),
        startLocation,
        locations
      };
      
      const response = await createTour(jsonBody).unwrap();
      const createdTourId = response.data?.tour?._id || response.data?.data?._id;

      // Second, if there are files, upload them to the newly created tour ID
      if (createCoverFile || createImageFiles.length > 0) {
        const fd = new FormData();
        if (createCoverFile) fd.append('imageCover', createCoverFile);
        createImageFiles.forEach((f) => fd.append('images', f));
        await updateTour({ id: createdTourId, body: fd }).unwrap();
      }

      showAlert('success', 'Tour created successfully!');
      setShowCreateModal(false);
      setCreateForm(EMPTY_CREATE);
      setCreateCoverFile(null);
      setCreateCoverPreview([]);
      setCreateImageFiles([]);
      setCreateImagesPreview([]);
    } catch (err) {
      showAlert('error', err?.data?.message || 'Failed to create tour.');
    }
  };

  // ── Delete Handler ──────────────────────────────────────────────────────────
  const handleDeleteTour = async () => {
    if (!deletingTour) return;
    try {
      await deleteTour(deletingTour._id).unwrap();
      showAlert('success', 'Tour deleted successfully!');
      setDeletingTour(null);
      if (tours.length === 1 && queryParams.page > 1) {
        setQueryParams((prev) => ({ ...prev, page: prev.page - 1 }));
      }
    } catch (err) {
      showAlert('error', err?.data?.message || 'Failed to delete tour.');
    }
  };

  const handleSort = (field) => {
    setQueryParams((prev) => {
      const isActive = prev.sort === field || prev.sort === `-${field}`;
      const isDesc = prev.sort === `-${field}`;
      return { ...prev, sort: isActive && !isDesc ? `-${field}` : field, page: 1 };
    });
  };

  if (!isReady || (user && user.role !== 'admin' && user.role !== 'lead-guide'))
    return <LoadingScreen />;

  return (
    <main className="bg-grey-100 min-h-[60vh]">
      <div className="bg-white max-w-[120rem] mx-auto min-h-screen md:min-h-0 rounded-none md:rounded-sm overflow-hidden shadow-userview flex flex-col lg:flex-row">
        <SideNav active="manage-tours" isAdmin={user.role === 'admin'} />

        <div className="flex-1 min-w-0 py-12 px-4 sm:px-8 xl:px-16 animate-move-in-bottom">
          <div className="max-w-[100rem] mx-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-10 border-b border-grey-200 pb-5">
              <div>
                <h1 className="text-3xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide">
                  Manage Tours
                </h1>
                <p className="text-sm text-grey-500 mt-1">
                  Browse, search, sort, edit, and delete adventure tours.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-grey-100 border border-grey-200 rounded-xl px-4 py-2">
                  <Map size={16} className="text-primary" />
                  <span className="text-sm font-bold text-grey-600">{total} Tours</span>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Create Tour</span>
                  <span className="sm:hidden">New</span>
                </button>
              </div>
            </div>

            {/* Quick Stats (fetched from backend) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
              <StatCard
                icon={<Star size={20} className="fill-amber-500" />}
                iconBg="bg-amber-100"
                iconColor="text-amber-500"
                label="Avg Rating"
                value={(stats.avgRating || 0).toFixed(1)}
                isLoading={isLoadingStats}
              />

              <StatCard
                icon={<BarChart2 size={20} />}
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
                label="Avg Price"
                value={formatPrice(stats.avgPrice)}
                isLoading={isLoadingStats}
              />

              <StatCard
                icon={<CheckCircle2 size={20} />}
                iconBg="bg-green-100"
                iconColor="text-green-600"
                label="Available"
                value={stats.numAvailableTours}
                isLoading={isLoadingStats}
              />

              <StatCard
                icon={<XCircle size={20} />}
                iconBg="bg-rose-100"
                iconColor="text-rose-600"
                label="Sold Out"
                value={stats.numSoldOut}
                isLoading={isLoadingStats}
              />
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between mb-8">
              <div className="relative w-full xl:w-96">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400" />
                <input
                  type="text"
                  placeholder="Search by tour name, summary..."
                  value={queryParams.search}
                  onChange={(e) =>
                    setQueryParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))
                  }
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-grey-100 border border-grey-200 focus:outline-none focus:border-primary text-sm transition-colors text-grey-700"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-start xl:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-grey-500 whitespace-nowrap">
                    Difficulty:
                  </span>
                  <select
                    value={queryParams.difficulty}
                    onChange={(e) =>
                      setQueryParams((prev) => ({ ...prev, difficulty: e.target.value, page: 1 }))
                    }
                    className="px-4 py-3 rounded-full bg-grey-100 border border-grey-200 text-sm text-grey-600 focus:outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="">All</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="difficult">Difficult</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-grey-500 whitespace-nowrap">
                    Availability:
                  </span>
                  <select
                    value={queryParams.available}
                    onChange={(e) =>
                      setQueryParams((prev) => ({ ...prev, available: e.target.value, page: 1 }))
                    }
                    className="px-4 py-3 rounded-full bg-grey-100 border border-grey-200 text-sm text-grey-600 focus:outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="">All</option>
                    <option value="true">Available</option>
                    <option value="false">Sold Out</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-grey-500 whitespace-nowrap">
                    Sort:
                  </span>
                  <select
                    value={queryParams.sort}
                    onChange={(e) =>
                      setQueryParams((prev) => ({ ...prev, sort: e.target.value, page: 1 }))
                    }
                    className="px-4 py-3 rounded-full bg-grey-100 border border-grey-200 text-sm text-grey-600 focus:outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="-createdAt">Newest First</option>
                    <option value="createdAt">Oldest First</option>
                    <option value="-ratingsAverage">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tours Table */}
            {isLoading ? (
              <div className="space-y-4 py-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-grey-200 rounded-xl animate-pulse w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center shadow-sm">
                <p className="font-semibold text-lg">Error loading tours</p>
                <p className="text-sm mt-1">
                  {error?.data?.message || error?.message || 'Please try again later.'}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-grey-200 shadow-sm overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-grey-50 border-b border-grey-200">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">
                          Tour
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">
                          Difficulty
                        </th>
                        <th
                          className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500 cursor-pointer select-none whitespace-nowrap"
                          onClick={() => handleSort('duration')}
                        >
                          <span className="flex items-center gap-1">
                            Duration <SortIcon field="duration" activeSort={queryParams.sort} />
                          </span>
                        </th>
                        <th
                          className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500 cursor-pointer select-none whitespace-nowrap"
                          onClick={() => handleSort('maxGroupSize')}
                        >
                          <span className="flex items-center gap-1">
                            Group Size <SortIcon field="maxGroupSize" activeSort={queryParams.sort} />
                          </span>
                        </th>
                        <th
                          className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500 cursor-pointer select-none whitespace-nowrap"
                          onClick={() => handleSort('ratingsAverage')}
                        >
                          <span className="flex items-center gap-1">
                            Rating <SortIcon field="ratingsAverage" activeSort={queryParams.sort} />
                          </span>
                        </th>
                        <th
                          className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500 cursor-pointer select-none whitespace-nowrap"
                          onClick={() => handleSort('price')}
                        >
                          <span className="flex items-center gap-1">
                            Price <SortIcon field="price" activeSort={queryParams.sort} />
                          </span>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">
                          Start Dates
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">
                          Availability
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey-200">
                      {tours.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-10 text-center text-sm text-grey-500">
                            No tours found matching your search.
                          </td>
                        </tr>
                      ) : (
                        tours.map((t) => (
                          <tr key={t._id} className="hover:bg-grey-50/50 transition-colors">
                            {/* Cover + Name */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-10 shrink-0 rounded-lg overflow-hidden border border-grey-200">
                                  <Image
                                    src={getCoverSrc(t)}
                                    alt={t.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <Link href={`/tour/${t.slug}`} className="font-semibold text-sm text-grey-700 truncate max-w-[180px]">
                                    {t.name}
                                  </Link>
                                  <p className="text-xs text-grey-400 truncate max-w-[180px]">
                                    {t.summary}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Difficulty */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${DIFFICULTY_STYLES[t.difficulty] || 'bg-grey-100 text-grey-600 border-grey-200'}`}
                              >
                                {t.difficulty}
                              </span>
                            </td>

                            {/* Duration */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-sm text-grey-600">
                                <Clock size={14} className="text-grey-400" />
                                {t.duration} days
                              </div>
                            </td>

                            {/* Max Group */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-sm text-grey-600">
                                <Users size={14} className="text-grey-400" />
                                {t.maxGroupSize}
                              </div>
                            </td>

                            {/* Rating */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Star size={14} className="fill-amber-400 text-amber-400" />
                                <span className="text-sm font-semibold text-grey-700">
                                  {t.ratingsAverage?.toFixed(1) ?? 'N/A'}
                                </span>
                                <span className="text-xs text-grey-400">({t.ratingsQuantity})</span>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-6 py-4 text-sm font-semibold text-grey-700 whitespace-nowrap">
                              {formatPrice(t.price)}
                            </td>

                            {/* Start Dates */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                {t.startDates && t.startDates.length > 0 ? (
                                  t.startDates.map((d, idx) => {
                                    const dateObj = new Date(d.startDate);
                                    const isPassed = dateObj < new Date();
                                    const formatted = dateObj.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    });
                                    return (
                                      <span
                                        key={idx}
                                        className={`text-xs px-2 py-0.5 rounded border inline-block w-fit font-medium ${
                                          d.soldOut || isPassed
                                            ? 'bg-grey-50 text-grey-400 border-grey-200 line-through'
                                            : 'bg-primary/5 text-primary border-primary/20'
                                        }`}
                                      >
                                        {formatted}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-xs text-grey-400">No dates</span>
                              )}
                              </div>
                            </td>

                            {/* Availability */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                  t.available
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {t.available ? 'Available' : 'Sold Out'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => handleEditClick(t)}
                                  className="p-2 rounded-full hover:bg-grey-100 text-primary transition-colors cursor-pointer"
                                  title="Edit Tour"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => setDeletingTour(t)}
                                  className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                                  title="Delete Tour"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Sticky Pagination */}
                {total > 0 &&
                  (() => {
                    const MAX_VISIBLE = 5;
                    const half = Math.floor(MAX_VISIBLE / 2);
                    let start = Math.max(1, queryParams.page - half);
                    let end = start + MAX_VISIBLE - 1;
                    if (end > totalPages) {
                      end = totalPages;
                      start = Math.max(1, end - MAX_VISIBLE + 1);
                    }
                    const pageRange = Array.from(
                      { length: end - start + 1 },
                      (_, idx) => start + idx
                    );
                    return (
                      <div className="sticky bottom-0 z-10 px-6 py-4 bg-grey-50 border-t border-grey-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-grey-600">
                          Showing {(queryParams.page - 1) * queryParams.limit + 1} to{' '}
                          {Math.min(queryParams.page * queryParams.limit, total)} of {total} tours
                        </p>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setQueryParams((prev) => ({ ...prev, page: prev.page - 1 }))
                            }
                            disabled={queryParams.page === 1}
                            className="p-2 rounded-lg border border-grey-200 text-grey-600 hover:bg-grey-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed mr-1 font-semibold"
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
                              {start > 2 && (
                                <span className="text-grey-400 font-bold px-1">…</span>
                              )}
                            </>
                          )}

                          {pageRange.map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() =>
                                setQueryParams((prev) => ({ ...prev, page: pageNum }))
                              }
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
                              {end < totalPages - 1 && (
                                <span className="text-grey-400 font-bold px-1">…</span>
                              )}
                              <button
                                onClick={() =>
                                  setQueryParams((prev) => ({ ...prev, page: totalPages }))
                                }
                                className="w-9 h-9 rounded-lg border border-grey-200 text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer text-grey-600 hover:bg-grey-100"
                              >
                                {totalPages}
                              </button>
                            </>
                          )}

                          <button
                            onClick={() =>
                              setQueryParams((prev) => ({ ...prev, page: prev.page + 1 }))
                            }
                            disabled={queryParams.page === totalPages}
                            className="p-2 rounded-lg border border-grey-200 text-grey-600 hover:bg-grey-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed ml-1 font-semibold"
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

      {/* ══════════════════════════════════════════════════════════════════════
          Create Tour Modal
      ══════════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-9999999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-move-in-bottom border border-grey-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-grey-200 flex items-center justify-between bg-grey-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus size={16} className="text-primary" />
                </div>
                <h3 className="font-bold text-lg text-grey-700">Create New Tour</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-grey-400 hover:text-grey-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTour} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label htmlFor="create-name" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                  Tour Name *
                </label>
                <input
                  id="create-name"
                  type="text"
                  required
                  placeholder="e.g. The Forest Hiker"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium"
                />
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="create-price" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                    Price ($) *
                  </label>
                  <div className="relative">
                    <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-400" />
                    <input
                      id="create-price"
                      type="number"
                      required
                      min="0"
                      placeholder="497"
                      value={createForm.price}
                      onChange={(e) => setCreateForm((p) => ({ ...p, price: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="create-duration" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                    Duration (days) *
                  </label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-400" />
                    <input
                      id="create-duration"
                      type="number"
                      required
                      min="1"
                      placeholder="7"
                      value={createForm.duration}
                      onChange={(e) => setCreateForm((p) => ({ ...p, duration: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Max Group Size & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="create-group" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                    Max Group Size *
                  </label>
                  <div className="relative">
                    <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-400" />
                    <input
                      id="create-group"
                      type="number"
                      required
                      min="1"
                      placeholder="15"
                      value={createForm.maxGroupSize}
                      onChange={(e) => setCreateForm((p) => ({ ...p, maxGroupSize: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="create-difficulty" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                    Difficulty *
                  </label>
                  <select
                    id="create-difficulty"
                    value={createForm.difficulty}
                    onChange={(e) => setCreateForm((p) => ({ ...p, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="difficult">Difficult</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label htmlFor="create-summary" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                  Summary *
                </label>
                <textarea
                  id="create-summary"
                  rows={2}
                  required
                  placeholder="Brief overview of the tour..."
                  value={createForm.summary}
                  onChange={(e) => setCreateForm((p) => ({ ...p, summary: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium resize-none"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="create-description" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                  Description
                </label>
                <textarea
                  id="create-description"
                  rows={3}
                  placeholder="Detailed description of the tour..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium resize-none"
                />
              </div>

              {/* Start Dates Section */}
              <StartDatesManager
                dates={createForm.startDates}
                onChange={(dates) => setCreateForm(p => ({ ...p, startDates: dates }))}
                tourId={undefined}
              />

              {/* Tour Guides Section */}
              <GuidesSelector
                selected={createForm.guides}
                guidesList={guidesList}
                onChange={(guides) => setCreateForm(p => ({ ...p, guides }))}
              />

              {/* Start Location Section */}
              <StartLocationForm
                value={createForm.startLocation}
                onChange={(loc) => setCreateForm(p => ({ ...p, startLocation: loc }))}
              />

              {/* Waypoints Locations Section */}
              <WaypointsManager
                locations={createForm.locations}
                onChange={(locs) => setCreateForm(p => ({ ...p, locations: locs }))}
              />

              {/* Cover Image */}
              <ImageUploadField
                label="Cover Image"
                id="create-imageCover"
                preview={createCoverPreview}
                onFile={handleCreateCoverChange}
                hint="(1 photo)"
              />

              {/* Gallery Images */}
              <ImageUploadField
                label="Gallery Images"
                id="create-images"
                multiple
                preview={createImagesPreview}
                onFile={handleCreateImagesChange}
                hint="(up to 3 photos)"
              />

              <div className="flex gap-3 justify-end pt-4 border-t border-grey-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 rounded-full border border-grey-200 hover:bg-grey-50 text-sm text-grey-600 transition-colors cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-sm text-white font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  {isCreating ? (
                    <>
                      <Upload size={15} className="animate-bounce" /> Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={15} /> Create Tour
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Edit Tour Modal
      ══════════════════════════════════════════════════════════════════════ */}
      {editingTour && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-move-in-bottom border border-grey-200">
            <div className="px-6 py-5 border-b border-grey-200 flex items-center justify-between bg-grey-50">
              <h3 className="font-bold text-lg text-grey-700">Edit Tour Details</h3>
              <button
                onClick={() => setEditingTour(null)}
                className="text-grey-400 hover:text-grey-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateTour} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label htmlFor="tour-name" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                  Tour Name
                </label>
                <input
                  id="tour-name"
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium"
                />
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tour-price" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                    Price ($)
                  </label>
                  <div className="relative">
                    <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-400" />
                    <input
                      id="tour-price"
                      type="number"
                      required
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tour-duration" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                    Duration (days)
                  </label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-400" />
                    <input
                      id="tour-duration"
                      type="number"
                      required
                      min="1"
                      value={editForm.duration}
                      onChange={(e) => setEditForm((p) => ({ ...p, duration: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Max Group Size & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tour-group" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                    Max Group Size
                  </label>
                  <div className="relative">
                    <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey-400" />
                    <input
                      id="tour-group"
                      type="number"
                      required
                      min="1"
                      value={editForm.maxGroupSize}
                      onChange={(e) => setEditForm((p) => ({ ...p, maxGroupSize: e.target.value }))}
                      className="w-full pl-9 pr-3 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tour-difficulty" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                    Difficulty
                  </label>
                  <select
                    id="tour-difficulty"
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm((p) => ({ ...p, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="difficult">Difficult</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label htmlFor="tour-summary" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                  Summary
                </label>
                <textarea
                  id="tour-summary"
                  rows={3}
                  required
                  value={editForm.summary}
                  onChange={(e) => setEditForm((p) => ({ ...p, summary: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium resize-none"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="tour-description" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                  Description
                </label>
                <textarea
                  id="tour-description"
                  rows={4}
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium resize-none"
                />
              </div>

              {/* Start Dates Section */}
              <StartDatesManager
                dates={editForm.startDates}
                onChange={(dates) => setEditForm(p => ({ ...p, startDates: dates }))}
                tourId={editingTour?._id}
              />

              {/* Tour Guides Section */}
              <GuidesSelector
                selected={editForm.guides}
                guidesList={guidesList}
                onChange={(guides) => setEditForm(p => ({ ...p, guides }))}
              />

              {/* Start Location Section */}
              <StartLocationForm
                value={editForm.startLocation}
                onChange={(loc) => setEditForm(p => ({ ...p, startLocation: loc }))}
              />

              {/* Waypoints Locations Section */}
              <WaypointsManager
                locations={editForm.locations}
                onChange={(locs) => setEditForm(p => ({ ...p, locations: locs }))}
              />

              {/* ── Image Section ─────────────────────────────────────────── */}
              <div className="pt-2 border-t border-grey-100">
                <p className="text-xs font-bold uppercase tracking-wider text-grey-400 mb-3 flex items-center gap-1.5">
                  <ImagePlus size={13} /> Update Images
                  <span className="font-normal normal-case text-grey-300">(optional — leave empty to keep current)</span>
                </p>

                <div className="space-y-3">
                  {/* Cover Image */}
                  <ImageUploadField
                    label="Cover Image"
                    id="edit-imageCover"
                    preview={editCoverPreview}
                    onFile={handleEditCoverChange}
                    hint="(replaces current cover)"
                  />

                  {/* Gallery Images */}
                  <ImageUploadField
                    label="Gallery Images"
                    id="edit-images"
                    multiple
                    preview={editImagesPreview}
                    onFile={handleEditImagesChange}
                    hint="(replaces all gallery photos)"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-grey-100">
                <button
                  type="button"
                  onClick={() => setEditingTour(null)}
                  className="px-5 py-3 rounded-full border border-grey-200 hover:bg-grey-50 text-sm text-grey-600 transition-colors cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-sm text-white font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  {isUpdating ? (
                    <>
                      <Upload size={15} className="animate-bounce" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Delete Confirmation Modal
      ══════════════════════════════════════════════════════════════════════ */}
      {deletingTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-move-in-bottom">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-bold text-lg text-grey-700 mb-2">Delete Tour</h3>
              <p className="text-sm text-grey-500 mb-6 px-4">
                Are you sure you want to permanently delete{' '}
                <strong>{deletingTour.name}</strong>? This will also remove all associated
                bookings and reviews. This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-center w-full">
                <button
                  type="button"
                  onClick={() => setDeletingTour(null)}
                  className="flex-1 py-3 rounded-full border border-grey-200 hover:bg-grey-50 text-sm text-grey-600 transition-colors cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTour}
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