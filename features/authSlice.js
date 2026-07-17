// features/authSlice.js
//
// RTK Query endpoints for every auth-related route:
//   POST /api/v1/users/signup
//   POST /api/v1/users/login
//   POST /api/v1/users/logout
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
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            apiSlice.util.upsertQueryData("getMe", undefined, {
              status: "success",
              data: { data: null },
            })
          );
        } catch {}
      },
      invalidatesTags: ["User", "Booking"],
    }),

    // ── Forgot Password ───────────────────────────────────────────────────
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "/users/forgotPassword",
        method: "POST",
        body,
      }),
    }),

    // ── Reset Password ────────────────────────────────────────────────────
    resetPassword: builder.mutation({
      query: ({ resetToken, ...body }) => ({
        url: `/users/resetPassword/${resetToken}`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          seedMeCache(dispatch, data?.data?.user ?? data?.user);
        } catch {}
      },
      invalidatesTags: ["User"],
    }),

    // ── Confirm Email ─────────────────────────────────────────────────────
    confirmEmail: builder.query({
      query: (confirmationToken) => ({
        url: `/users/confirmEmail/${confirmationToken}`,
        method: "GET",
      }),
    }),
  }),
});

export const { 
  useSignupMutation, 
  useLoginMutation, 
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useConfirmEmailQuery,
} = authApiSlice;
