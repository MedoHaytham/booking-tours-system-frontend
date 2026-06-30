// features/userSlice.js
//
// RTK Query endpoints for the logged-in user's own profile.
//
// Endpoints:
//   GET   /api/v1/users/me              → fetch current user
//   PATCH /api/v1/users/updateMe        → update name / photo (FormData or JSON)
//   PATCH /api/v1/users/updateMyPassword → change password

import apiSlice from "../api/apiSlice";

const userApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ── Get current user ──────────────────────────────────────────────────
    getMe: builder.query({
      query: () => "/users/me",
      providesTags: ["User"],
    }),

    // ── Update profile (name / photo) ─────────────────────────────────────
    // Pass a FormData object when uploading a photo, plain object otherwise.
    updateMe: builder.mutation({
      query: (formData) => ({
        url: "/users/updateMe",
        method: "PATCH",
        body: formData,
        // Let the browser set the correct multipart boundary when sending FormData
        formData: formData instanceof FormData,
      }),
      invalidatesTags: ["User"],
    }),

    // ── Change password ───────────────────────────────────────────────────
    updateMyPassword: builder.mutation({
      query: (passwords) => ({
        url: "/users/updateMyPassword",
        method: "PATCH",
        body: passwords,
      }),
      // After a password change the API rotates the JWT cookie — clear cache
      invalidatesTags: ["User"],
    }),

    // ── Admin: Get all users ──────────────────────────────────────────────
    getAllUsers: builder.query({
      query: ({ page = 1, limit = 10, search = '', role = '' } = {}) => {
        const params = { page, limit };
        if (search) params.search = search;
        if (role) params.role = role;
        return { url: "/users", params };
      },
      providesTags: ["User"],
    }),

    // ── Admin: Get users stats ──────────────────────────────────────────────
    getUsersStats: builder.query({
      query: () => '/users/stats',
      providesTags: ['User'],
    }),

    // ── Admin: Update user ────────────────────────────────────────────────
    updateUser: builder.mutation({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // ── Admin: Delete user ────────────────────────────────────────────────
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useUpdateMyPasswordMutation,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUsersStatsQuery,
} = userApiSlice;
