// features/bookingSlice.js
//
// RTK Query endpoints for bookings / checkout.
//
// Endpoints:
//   GET /api/v1/bookings/checkout-session/:tourId  → Stripe checkout session URL
//   GET /api/v1/bookings/my-tours                  → tours the current user booked

import apiSlice from "../api/apiSlice";

const bookingApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ── Get Stripe checkout session ───────────────────────────────────────
    // The API returns { session: { url: '...' } }. Redirect the browser to
    // session.url to complete payment on Stripe's hosted page.
    getCheckoutSession: builder.query({
      query: (tourId) => `/bookings/checkout-session/${tourId}`,
    }),

    // ── My booked tours ───────────────────────────────────────────────────
    getMyTours: builder.query({
      query: () => "/bookings/my-tours",
      providesTags: ["Booking"],
    }),
  }),
});

export const { useGetCheckoutSessionQuery, useLazyGetCheckoutSessionQuery, useGetMyToursQuery } =
  bookingApiSlice;
