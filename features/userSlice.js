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
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useUpdateMyPasswordMutation,
} = userApiSlice;
