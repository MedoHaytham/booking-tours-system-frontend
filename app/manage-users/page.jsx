'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Edit,
  Trash2,
  Users,
  ShieldAlert,
  UserCheck,
  Shield,
  X
} from 'lucide-react';

import LoadingScreen from '@/components/LoadingScreen';
import SideNav from '@/components/SideNav';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUsersStatsQuery,
} from '@/features/userSlice';
import { useAlert } from '@/context/AlertContext';

function getRoleBadgeClass(role) {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'lead-guide':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'guide':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-grey-200 text-grey-600 border-grey-300';
  }
}

export default function ManageUsersPage() {
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

  const [queryParams, setQueryParams] = useState({ page: 1, limit: 10, search: '', role: '' });


  const { data: responseData, isLoading, error } = useGetAllUsersQuery(
    {
      page: queryParams.page,
      limit: queryParams.limit,
      ...(queryParams.search && { search: queryParams.search }),
      ...(queryParams.role && { role: queryParams.role }),
    },
    { skip: !isReady || user?.role !== 'admin' }
  );

  const users = useMemo(() => responseData?.data?.data || [], [responseData]);
  const total = responseData?.total || 0;
  const totalPages = Math.ceil(total / queryParams.limit) || 1;

  // Edit / Delete States
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [deletingUser, setDeletingUser] = useState(null);

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();


  const { data: statsData, isLoading: isStatsLoading } = useGetUsersStatsQuery(undefined, {
    skip: !isReady || user?.role !== 'admin'
  });
  const stats = statsData?.data || { total: 0, admins: 0, guides: 0, regular: 0 };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUser({
        id: editingUser._id,
        body: { role: selectedRole },
      }).unwrap();
      showAlert('success', 'User role updated successfully!');
      setEditingUser(null);
    } catch (err) {
      showAlert('error', err?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser(deletingUser._id).unwrap();
      showAlert('success', 'User deleted successfully!');
      setDeletingUser(null);
    } catch (err) {
      showAlert('error', err?.data?.message || 'Failed to delete user.');
    }
  };

  if (!isReady || (user && user.role !== 'admin')) return <LoadingScreen />;

  return (
    <main className="bg-grey-100 min-h-[60vh]">
      <div className="bg-white max-w-[120rem] mx-auto min-h-screen md:min-h-0 rounded-none md:rounded-sm overflow-hidden shadow-userview flex flex-col lg:flex-row">
        <SideNav active="manage-users" isAdmin={user.role === 'admin'} />

        <div className="flex-1 min-w-0 py-12 px-4 sm:px-8 xl:px-16 animate-move-in-bottom">
          <div className="max-w-[100rem] mx-auto">
            {/* Header Title */}
            <div className="flex justify-between items-center mb-10 border-b border-grey-200 pb-5">
              <div>
                <h1 className="text-3xl uppercase font-bold bg-gradient-primary-text bg-clip-text text-transparent tracking-wide">
                  Manage Users
                </h1>
                <p className="text-sm text-grey-500 mt-1">
                  View, configure user roles, and manage system accounts.
                </p>
              </div>
            </div>

            {/* Quick Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <div className="bg-grey-100 p-6 rounded-xl border border-grey-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs text-grey-500 font-bold uppercase tracking-wider">Total Users</p>
                  <h3 className="text-2xl font-bold text-grey-700">{isStatsLoading ? '...' : stats.total}</h3>
                </div>
              </div>

              <div className="bg-grey-100 p-6 rounded-xl border border-grey-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="text-xs text-grey-500 font-bold uppercase tracking-wider">Admins</p>
                  <h3 className="text-2xl font-bold text-grey-700">{isStatsLoading ? '...' : stats.admins}</h3>
                </div>
              </div>

              <div className="bg-grey-100 p-6 rounded-xl border border-grey-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                  <UserCheck size={24} />
                </div>
                <div>
                  <p className="text-xs text-grey-500 font-bold uppercase tracking-wider">Guides</p>
                  <h3 className="text-2xl font-bold text-grey-700">{isStatsLoading ? '...' : stats.guides}</h3>
                </div>
              </div>

              <div className="bg-grey-100 p-6 rounded-xl border border-grey-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs text-grey-500 font-bold uppercase tracking-wider">Customers</p>
                  <h3 className="text-2xl font-bold text-grey-700">{isStatsLoading ? '...' : stats.regular}</h3>
                </div>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between mb-8">
              <div className="relative w-full xl:w-80">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={queryParams.search}
                  onChange={(e) => setQueryParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-grey-100 border border-grey-200 focus:outline-none focus:border-primary text-sm transition-colors text-grey-700"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-start xl:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-grey-500 whitespace-nowrap">
                    Role:
                  </span>
                  <select
                    value={queryParams.role || 'all'}
                    onChange={(e) => setQueryParams(prev => ({ ...prev, role: e.target.value === 'all' ? '' : e.target.value, page: 1 }))}
                    className="px-4 py-3 rounded-full bg-grey-100 border border-grey-200 text-sm text-grey-600 focus:outline-none focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="guide">Guide</option>
                    <option value="lead-guide">Lead Guide</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Data Grid/Table */}
            {isLoading ? (
              <div className="space-y-4 py-10">
                <div className="h-12 bg-grey-200 rounded-xl animate-pulse w-full"></div>
                <div className="h-16 bg-grey-200 rounded-xl animate-pulse w-full"></div>
                <div className="h-16 bg-grey-200 rounded-xl animate-pulse w-full"></div>
                <div className="h-16 bg-grey-200 rounded-xl animate-pulse w-full"></div>
              </div>
            ) : error ? (
              <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center shadow-sm">
                <p className="font-semibold text-lg">Error loading users</p>
                <p className="text-sm mt-1">{error?.data?.message || error?.message || 'Please try again later.'}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-grey-200 shadow-sm overflow-hidden">
                {/* Scrollable table area */}
                <div className="overflow-x-auto bg-white">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-grey-50 border-b border-grey-200">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">User</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Email</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500">Role</th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-grey-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey-200">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-sm text-grey-500">
                            No users found matching your search.
                          </td>
                        </tr>
                      ) : (
                        users?.map((u) => {
                          const userPhoto = u.photo?.startsWith('http')
                            ? u.photo
                            : `/img/users/${u.photo || 'default.jpg'}`;
                          const isSelf = user._id === u._id;
                          return (
                            <tr key={u._id} className="hover:bg-grey-50/50 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <Image
                                  src={userPhoto}
                                  alt={u.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover w-10 h-10 border border-grey-200"
                                />
                                <span className="w-41 font-semibold text-sm text-grey-700 line-clamp-2">{u.name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-grey-200 text-grey-600 font-bold px-1.5 py-0.5 rounded uppercase ml-2">
                                    You
                                  </span>
                                )}
                              </td>
                              <td className="max-w-60 xl:max-w-40 px-6 py-4 text-sm text-grey-600 truncate">{u.email}</td>
                              <td className="px-6 py-4">
                                <span className={`${u.role === 'lead-guide' ? 'w-25' : 'w-fit'} inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getRoleBadgeClass(u.role)}`}>
                                  {u.role}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    onClick={() => {
                                      setEditingUser(u);
                                      setSelectedRole(u.role);
                                    }}
                                    className="p-2 rounded-full hover:bg-grey-100 text-primary transition-colors cursor-pointer"
                                    title="Edit Role"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => setDeletingUser(u)}
                                    className={`p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors cursor-pointer ${
                                      isSelf ? 'opacity-30 cursor-not-allowed' : ''
                                    }`}
                                    title={isSelf ? 'Cannot delete yourself' : 'Delete User'}
                                    disabled={isSelf}
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

                {/* Pagination Controls — Sticky outside the scrollable table */}
                {users?.length > 0 && (() => {
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
                        Showing {((queryParams.page - 1) * queryParams.limit) + 1} to {Math.min(queryParams.page * queryParams.limit, total)} of {total} users
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

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-move-in-bottom">
            <div className="px-6 py-5 border-b border-grey-200 flex items-center justify-between bg-grey-50">
              <h3 className="font-bold text-lg text-grey-700">Edit User Role</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-grey-400 hover:text-grey-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-2">
                  User Info
                </label>
                <div className="flex items-center gap-3 bg-grey-100 p-3 rounded-xl border border-grey-200">
                  <Image
                    src={
                      editingUser.photo?.startsWith('http')
                        ? editingUser.photo
                        : `/img/users/${editingUser.photo || 'default.jpg'}`
                    }
                    alt={editingUser.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover w-10 h-10 border border-grey-200"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-grey-700 truncate">{editingUser.name}</p>
                    <p className="text-xs text-grey-500 truncate">{editingUser.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="role-select" className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-2">
                  Select Role
                </label>
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary cursor-pointer font-medium"
                >
                  <option value="user">User</option>
                  <option value="guide">Guide</option>
                  <option value="lead-guide">Lead Guide</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-grey-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-move-in-bottom">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <ShieldAlert size={24} />
              </div>
              <h3 className="font-bold text-lg text-grey-700 mb-2">Delete User Account</h3>
              <p className="text-sm text-grey-500 mb-6 px-4">
                Are you sure you want to delete <strong>{deletingUser.name}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-center w-full">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="flex-1 py-3 rounded-full border border-grey-200 hover:bg-grey-50 text-sm text-grey-600 transition-colors cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
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