// features/authSlice.js
//
// RTK Query endpoints for every auth-related route:
//   POST /api/v1/users/signup
//   POST /api/v1/users/login
//   GET  /api/v1/users/logout
//
// The API sets/clears an httpOnly JWT cookie on login/logout — that is why
// credentials:"include" is set on the base query in apiSlice.js.

import apiSlice from "../api/apiSlice";

// Helper: seed the getMe cache immediately so the Header updates without
// waiting for the background re-fetch triggered by invalidatesTags.
function seedMeCache(dispatch, user) {
  if (!user) return;
  dispatch(
    apiSlice.util.upsertQueryData("getMe", undefined, {
      status: "success",
      data: { data: user },
    })
  );
}

const authApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ── Signup ────────────────────────────────────────────────────────────
    signup: builder.mutation({
      query: (credentials) => ({
        url: "/users/signup",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          seedMeCache(dispatch, data?.data?.user ?? data?.user);
        } catch {}
      },
      invalidatesTags: ["User"],
    }),

    // ── Login ─────────────────────────────────────────────────────────────
    login: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          seedMeCache(dispatch, data?.data?.user ?? data?.user);
        } catch {}
      },
      invalidatesTags: ["User"],
    }),

    // ── Logout ────────────────────────────────────────────────────────────
    logout: builder.mutation({
      query: () => ({
        url: "/users/logout",
        method: "GET",
      }),
      // Clear everything from cache so protected data is not visible after logout
      invalidatesTags: ["User", "Booking"],
    }),
  }),
});

export const { useSignupMutation, useLoginMutation, useLogoutMutation } =
  authApiSlice;

