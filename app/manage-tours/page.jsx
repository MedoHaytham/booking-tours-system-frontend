'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
  ChevronUp,
  ChevronDown,
  AlertCircle,
  BarChart2,
  CheckCircle2,
  XCircle,
  Plus,
  ImagePlus,
  Upload,
  MapPin,
} from 'lucide-react';

import LoadingScreen from '@/components/LoadingScreen';
import SideNav from '@/components/SideNav';
import StatCard from '@/components/StatCard';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  useGetAdminToursQuery,
  useCreateTourMutation,
  useCreateTourStartDateMutation,
  useDeleteTourMutation,
  useUpdateTourMutation,
  useGetTourStatsQuery,
} from '@/features/tourSlice';
import { useGetAllUsersQuery } from '@/features/userSlice';
import { useAlert } from '@/context/AlertContext';
import Link from 'next/link';

const DIFFICULTY_STYLES = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  difficult: 'bg-rose-50 text-rose-700 border-rose-200',
};

function SortIcon({ field, activeSort }) {
  const isDesc = activeSort === `-${field}`;
  const isAsc = activeSort === field;
  if (isDesc) return <ChevronDown size={14} className="text-primary" />;
  if (isAsc) return <ChevronUp size={14} className="text-primary" />;
  return <ChevronDown size={14} className="text-grey-400 opacity-50" />;
}

// ─── Image Upload Preview Component ──────────────────────────────────────────
function ImageUploadField({ label, id, accept, multiple, preview, onFile, hint }) {
  const inputRef = useRef(null);

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
        {label}
        {hint && <span className="ml-1 font-normal normal-case text-grey-400">{hint}</span>}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full min-h-[90px] border-2 border-dashed border-grey-200 rounded-xl bg-grey-50 hover:bg-grey-100 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center gap-3 overflow-hidden"
      >
        {preview?.length ? (
          <div className="flex flex-wrap gap-2 p-3 justify-center">
            {preview.map((src, i) => (
              <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden border border-grey-200 shrink-0">
                <Image src={src} alt={`preview-${i}`} fill sizes="80px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-grey-400 py-3">
            <ImagePlus size={24} />
            <span className="text-xs font-medium">Click to upload</span>
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept || 'image/*'}
          multiple={!!multiple}
          className="hidden"
          onChange={onFile}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
  const { data: responseData, isLoading, error } = useGetAdminToursQuery(
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
  const [createTourStartDate, { isLoading: isAddingDate }] = useCreateTourStartDateMutation();
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

  const [newCreateLocation, setNewCreateLocation] = useState({
    day: 1, address: '', description: '', lat: '', lng: ''
  });
  const [newEditLocation, setNewEditLocation] = useState({
    day: 1, address: '', description: '', lat: '', lng: ''
  });

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
              <div className="pt-2 border-t border-grey-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                  Start Dates * <span className="font-normal normal-case text-grey-400">(between 1 and 3 dates)</span>
                </label>
                
                {/* List of currently added start dates */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {createForm.startDates?.map((d, index) => (
                    <div key={index} className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                      <span>{new Date(d.startDate).toLocaleDateString()}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = createForm.startDates.filter((_, i) => i !== index);
                          setCreateForm(prev => ({ ...prev, startDates: updated }));
                        }}
                        className="hover:text-primary-dark transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {(!createForm.startDates || createForm.startDates.length === 0) && (
                    <span className="text-xs text-grey-400 italic">No start dates added yet. At least 1 is required.</span>
                  )}
                </div>

                {/* Add new date input */}
                {(!createForm.startDates || createForm.startDates.length < 3) && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      id="new-create-start-date"
                      min={new Date().toISOString().split('T')[0]}
                      className="flex-1 px-4 py-2 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('new-create-start-date');
                        const val = input?.value;
                        if (!val) return;
                        const exists = createForm.startDates?.some(d => d.startDate === val);
                        if (exists) {
                          showAlert('error', 'This date is already added.');
                          return;
                        }
                        const updated = [...(createForm.startDates || []), { startDate: val }];
                        setCreateForm(prev => ({ ...prev, startDates: updated }));
                        if (input) input.value = '';
                      }}
                      className="px-4 py-2 bg-grey-200 hover:bg-grey-300 text-grey-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Add Date
                    </button>
                  </div>
                )}
              </div>

              {/* Tour Guides Section */}
              <div className="pt-2 border-t border-grey-100 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 items-center gap-1">
                  <Users size={14} className="text-primary" /> Tour Guides
                </label>
                
                {/* List of currently selected guides */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {createForm.guides?.map((guideId) => {
                    const guideObj = guidesList.find(g => g._id === guideId);
                    if (!guideObj) return null;
                    return (
                      <div key={guideId} className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                        <span>{guideObj.name} ({guideObj.role})</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = createForm.guides.filter(id => id !== guideId);
                            setCreateForm(prev => ({ ...prev, guides: updated }));
                          }}
                          className="hover:text-primary-dark transition-colors cursor-pointer flex items-center justify-center"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                  {(!createForm.guides || createForm.guides.length === 0) && (
                    <span className="text-xs text-grey-450 italic">No guides assigned to this tour yet.</span>
                  )}
                </div>

                {/* Select dropdown to add a guide */}
                <div className="flex gap-2">
                  <select
                    id="new-create-guide"
                    className="flex-1 px-4 py-2 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a guide to add...</option>
                    {guidesList
                      .filter(g => !(createForm.guides || []).includes(g._id))
                      .map(g => (
                        <option key={g._id} value={g._id}>
                          {g.name} ({g.role})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const select = document.getElementById('new-create-guide');
                      const val = select?.value;
                      if (!val) return;
                      const updated = [...(createForm.guides || []), val];
                      setCreateForm(prev => ({ ...prev, guides: updated }));
                      if (select) select.value = '';
                    }}
                    className="px-4 py-2 bg-grey-200 hover:bg-grey-300 text-grey-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Add Guide
                  </button>
                </div>
              </div>

              {/* Start Location Section */}
              <div className="pt-2 border-t border-grey-100 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 items-center gap-1">
                  <MapPin size={14} className="text-primary" /> Start Location
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-grey-450 uppercase mb-1">Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Biscayne Bay"
                      value={createForm.startLocation?.address || ''}
                      onChange={(e) => setCreateForm(prev => ({
                        ...prev,
                        startLocation: { ...(prev.startLocation || {}), address: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-xl bg-grey-100 border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-grey-450 uppercase mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Miami, USA"
                      value={createForm.startLocation?.description || ''}
                      onChange={(e) => setCreateForm(prev => ({
                        ...prev,
                        startLocation: { ...(prev.startLocation || {}), description: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-xl bg-grey-100 border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-grey-450 uppercase mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 25.79"
                      value={createForm.startLocation?.coordinates?.[1] ?? ''}
                      onChange={(e) => setCreateForm(prev => {
                        const coords = [...(prev.startLocation?.coordinates || [0, 0])];
                        coords[1] = e.target.value === '' ? '' : Number(e.target.value);
                        return {
                          ...prev,
                          startLocation: { ...(prev.startLocation || {}), coordinates: coords }
                        };
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-grey-100 border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-grey-450 uppercase mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. -80.13"
                      value={createForm.startLocation?.coordinates?.[0] ?? ''}
                      onChange={(e) => setCreateForm(prev => {
                        const coords = [...(prev.startLocation?.coordinates || [0, 0])];
                        coords[0] = e.target.value === '' ? '' : Number(e.target.value);
                        return {
                          ...prev,
                          startLocation: { ...(prev.startLocation || {}), coordinates: coords }
                        };
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-grey-100 border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Waypoints Locations Section */}
              <div className="pt-2 border-t border-grey-100 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 items-center gap-1">
                  <Map size={14} className="text-primary" /> Waypoints (Locations)
                </label>

                {/* List of currently added locations */}
                <div className="space-y-2">
                  {createForm.locations?.map((loc, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-grey-50 border border-grey-200 p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="font-bold text-primary mr-1.5">Day {loc.day}:</span>
                        <span className="font-semibold text-grey-700">{loc.address}</span>
                        <span className="text-grey-400 ml-1">({loc.description})</span>
                        <span className="text-[10px] text-grey-400 block mt-0.5">Coordinates: [{loc.coordinates?.[1]}, {loc.coordinates?.[0]}]</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = createForm.locations.filter((_, i) => i !== idx);
                          setCreateForm(prev => ({ ...prev, locations: updated }));
                        }}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {(!createForm.locations || createForm.locations.length === 0) && (
                    <span className="text-xs text-grey-450 italic block">No waypoints added yet.</span>
                  )}
                </div>

                {/* Inputs to add new location */}
                <div className="bg-grey-50 border border-grey-200 p-3 rounded-xl space-y-3">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-grey-500">Add New Waypoint</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">Day</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={newCreateLocation.day}
                        onChange={(e) => setNewCreateLocation(p => ({ ...p, day: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">Address</label>
                      <input
                        type="text"
                        placeholder="e.g. Biscayne Bay"
                        value={newCreateLocation.address}
                        onChange={(e) => setNewCreateLocation(p => ({ ...p, address: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3">
                      <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Miami, USA"
                        value={newCreateLocation.description}
                        onChange={(e) => setNewCreateLocation(p => ({ ...p, description: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 24.55"
                        value={newCreateLocation.lat}
                        onChange={(e) => setNewCreateLocation(p => ({ ...p, lat: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. -81.78"
                        value={newCreateLocation.lng}
                        onChange={(e) => setNewCreateLocation(p => ({ ...p, lng: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCreateLocation.address || !newCreateLocation.description) {
                        showAlert('error', 'Please fill in address and description.');
                        return;
                      }
                      const coords = [Number(newCreateLocation.lng || 0), Number(newCreateLocation.lat || 0)];
                      const updated = [
                        ...(createForm.locations || []),
                        {
                          day: Number(newCreateLocation.day || 1),
                          address: newCreateLocation.address,
                          description: newCreateLocation.description,
                          coordinates: coords
                        }
                      ];
                      setCreateForm(prev => ({ ...prev, locations: updated }));
                      setNewCreateLocation({ day: 1, address: '', description: '', lat: '', lng: '' });
                    }}
                    className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Add Waypoint
                  </button>
                </div>
              </div>

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
              <div className="pt-2 border-t border-grey-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
                  Start Dates * <span className="font-normal normal-case text-grey-400">(between 1 and 3 dates)</span>
                </label>

                <div className="space-y-3">
                  {editForm.startDates?.map((d, index) => {
                    const dateVal = d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '';
                    const isPassed = d.startDate ? new Date(d.startDate) < new Date() : false;
                    const isSoldOut = !!d.soldOut;
                    const isStruck = isPassed || isSoldOut;
                    return (
                      <div key={index} className={`flex gap-2 items-center rounded-xl px-2 py-1 transition-colors ${
                        isStruck ? 'bg-grey-50 border border-grey-200' : ''
                      }`}>
                        <div className="flex-1 relative">
                          <input
                            type="date"
                            value={dateVal}
                            readOnly={isPassed}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val || isPassed) return;
                              const updated = [...editForm.startDates];
                              updated[index] = { ...updated[index], startDate: val };
                              setEditForm(prev => ({ ...prev, startDates: updated }));
                            }}
                            className={`w-full px-4 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:border-primary ${
                              isStruck
                                ? 'bg-grey-100 border-grey-200 text-grey-400 line-through'
                                : 'bg-grey-100 border-grey-200 text-grey-700'
                            }`}
                          />
                          {isSoldOut && !isPassed && (
                            <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">
                              Sold Out
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (editForm.startDates.length <= 1) {
                              showAlert('error', 'A tour must have at least one start date.');
                              return;
                            }
                            const updated = editForm.startDates.filter((_, i) => i !== index);
                            setEditForm(prev => ({ ...prev, startDates: updated }));
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Date"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                  
                  {(() => {
                    const now = new Date();
                    // Only count future dates that are NOT sold out
                    const activeCount = (editForm.startDates || []).filter(d =>
                      d.startDate && new Date(d.startDate) >= now && !d.soldOut
                    ).length;
                    return activeCount < 3;
                  })() && (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="date"
                        id="new-edit-start-date"
                        className="flex-1 px-4 py-2 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium"
                      />
                      <button
                        type="button"
                        disabled={isAddingDate}
                        onClick={async () => {
                          const input = document.getElementById('new-edit-start-date');
                          const val = input?.value;
                          if (!val) return;
                          const now = new Date();
                          // Only block if duplicate among active (future + not sold out) dates
                          // Passed / sold-out dates with the same value are fine — backend will replace them
                          const exists = editForm.startDates?.some(d => {
                            const existingDateStr = d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '';
                            const isFuture = d.startDate && new Date(d.startDate) >= now;
                            const isActive = isFuture && !d.soldOut;
                            return isActive && existingDateStr === val;
                          });
                          if (exists) {
                            showAlert('error', 'This date is already added.');
                            return;
                          }
                          try {
                            const res = await createTourStartDate({
                              id: editingTour._id,
                              body: { startDate: val, soldOut: false },
                            }).unwrap();
                            // Backend returns the full updated tour; grab the newly added date (last in array)
                            const updatedTour = res?.data?.tour;
                            const newDate = updatedTour?.startDates?.[updatedTour.startDates.length - 1]
                              || { startDate: val, soldOut: false, participants: 0 };
                            setEditForm(prev => ({ ...prev, startDates: updatedTour?.startDates ?? [...(prev.startDates || []), newDate] }));
                            if (input) input.value = '';
                            showAlert('success', 'Start date added successfully!');
                          } catch (err) {
                            showAlert('error', err?.data?.message || 'Failed to add start date.');
                          }
                        }}
                        className="px-4 py-2 bg-grey-200 hover:bg-grey-300 disabled:opacity-60 text-grey-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        {isAddingDate ? 'Adding...' : 'Add Date'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tour Guides Section */}
              <div className="pt-2 border-t border-grey-100 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 items-center gap-1">
                  <Users size={14} className="text-primary" /> Tour Guides
                </label>
                
                {/* List of currently selected guides */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {editForm.guides?.map((guideId) => {
                    const guideObj = guidesList.find(g => g._id === guideId);
                    if (!guideObj) return null;
                    return (
                      <div key={guideId} className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                        <span>{guideObj.name} ({guideObj.role})</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editForm.guides.filter(id => id !== guideId);
                            setEditForm(prev => ({ ...prev, guides: updated }));
                          }}
                          className="hover:text-primary-dark transition-colors cursor-pointer flex items-center justify-center"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                  {(!editForm.guides || editForm.guides.length === 0) && (
                    <span className="text-xs text-grey-450 italic">No guides assigned to this tour yet.</span>
                  )}
                </div>

                {/* Select dropdown to add a guide */}
                <div className="flex gap-2">
                  <select
                    id="new-edit-guide"
                    className="flex-1 px-4 py-2 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a guide to add...</option>
                    {guidesList
                      .filter(g => !(editForm.guides || []).includes(g._id))
                      .map(g => (
                        <option key={g._id} value={g._id}>
                          {g.name} ({g.role})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const select = document.getElementById('new-edit-guide');
                      const val = select?.value;
                      if (!val) return;
                      const updated = [...(editForm.guides || []), val];
                      setEditForm(prev => ({ ...prev, guides: updated }));
                      if (select) select.value = '';
                    }}
                    className="px-4 py-2 bg-grey-200 hover:bg-grey-300 text-grey-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Add Guide
                  </button>
                </div>
              </div>

              {/* Start Location Section */}
              <div className="pt-2 border-t border-grey-100 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 items-center gap-1">
                  <MapPin size={14} className="text-primary" /> Start Location
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-grey-450 uppercase mb-1">Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Biscayne Bay"
                      value={editForm.startLocation?.address || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        startLocation: { ...(prev.startLocation || {}), address: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-xl bg-grey-100 border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-grey-450 uppercase mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Miami, USA"
                      value={editForm.startLocation?.description || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        startLocation: { ...(prev.startLocation || {}), description: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-xl bg-grey-100 border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-grey-450 uppercase mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 25.79"
                      value={editForm.startLocation?.coordinates?.[1] ?? ''}
                      onChange={(e) => setEditForm(prev => {
                        const coords = [...(prev.startLocation?.coordinates || [0, 0])];
                        coords[1] = e.target.value === '' ? '' : Number(e.target.value);
                        return {
                          ...prev,
                          startLocation: { ...(prev.startLocation || {}), coordinates: coords }
                        };
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-grey-100 border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-grey-450 uppercase mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. -80.13"
                      value={editForm.startLocation?.coordinates?.[0] ?? ''}
                      onChange={(e) => setEditForm(prev => {
                        const coords = [...(prev.startLocation?.coordinates || [0, 0])];
                        coords[0] = e.target.value === '' ? '' : Number(e.target.value);
                        return {
                          ...prev,
                          startLocation: { ...(prev.startLocation || {}), coordinates: coords }
                        };
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-grey-100 border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Waypoints Locations Section */}
              <div className="pt-2 border-t border-grey-100 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-grey-500 flex items-center gap-1">
                  <Map size={14} className="text-primary" /> Waypoints (Locations)
                </label>

                {/* List of currently added locations */}
                <div className="space-y-2">
                  {editForm.locations?.map((loc, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-grey-50 border border-grey-200 p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="font-bold text-primary mr-1.5">Day {loc.day}:</span>
                        <span className="font-semibold text-grey-700">{loc.address}</span>
                        <span className="text-grey-400 ml-1">({loc.description})</span>
                        <span className="text-[10px] text-grey-400 block mt-0.5">Coordinates: [{loc.coordinates?.[1]}, {loc.coordinates?.[0]}]</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editForm.locations.filter((_, i) => i !== idx);
                          setEditForm(prev => ({ ...prev, locations: updated }));
                        }}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {(!editForm.locations || editForm.locations.length === 0) && (
                    <span className="text-xs text-grey-450 italic block">No waypoints added yet.</span>
                  )}
                </div>

                {/* Inputs to add new location */}
                <div className="bg-grey-50 border border-grey-200 p-3 rounded-xl space-y-3">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-grey-500">Add New Waypoint</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">Day</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={newEditLocation.day}
                        onChange={(e) => setNewEditLocation(p => ({ ...p, day: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">Address</label>
                      <input
                        type="text"
                        placeholder="e.g. Biscayne Bay"
                        value={newEditLocation.address}
                        onChange={(e) => setNewEditLocation(p => ({ ...p, address: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3">
                      <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Miami, USA"
                        value={newEditLocation.description}
                        onChange={(e) => setNewEditLocation(p => ({ ...p, description: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 24.55"
                        value={newEditLocation.lat}
                        onChange={(e) => setNewEditLocation(p => ({ ...p, lat: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. -81.78"
                        value={newEditLocation.lng}
                        onChange={(e) => setNewEditLocation(p => ({ ...p, lng: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newEditLocation.address || !newEditLocation.description) {
                        showAlert('error', 'Please fill in address and description.');
                        return;
                      }
                      const coords = [Number(newEditLocation.lng || 0), Number(newEditLocation.lat || 0)];
                      const updated = [
                        ...(editForm.locations || []),
                        {
                          day: Number(newEditLocation.day || 1),
                          address: newEditLocation.address,
                          description: newEditLocation.description,
                          coordinates: coords
                        }
                      ];
                      setEditForm(prev => ({ ...prev, locations: updated }));
                      setNewEditLocation({ day: 1, address: '', description: '', lat: '', lng: '' });
                    }}
                    className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Add Waypoint
                  </button>
                </div>
              </div>

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