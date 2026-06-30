// features/tourSlice.js
//
// RTK Query endpoints for tour data (client-side use only).
// For server-side data fetching from Server Components, use
//
// Endpoints:
//   GET /api/v1/tours                   → list of all tours
//   GET /api/v1/tours/slug/:slug        → single tour by slug (with guides + reviews)

import apiSlice from "../api/apiSlice";

const tourApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ── All tours ─────────────────────────────────────────────────────────
    getAllTours: builder.query({
      query: () => "/tours",
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ _id }) => ({ type: "Tour", id: _id })),
              { type: "Tour", id: "LIST" },
            ]
          : [{ type: "Tour", id: "LIST" }],
    }),

    // ── Single tour by slug ───────────────────────────────────────────────
    // Requires a small custom route on the API:
    //   GET /api/v1/tours/slug/:slug   (populated with guides + reviews)
    getTourBySlug: builder.query({
      query: (slug) => `/tours/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Tour", id: slug }],
    }),
  }),
});

export const { useGetAllToursQuery, useGetTourBySlugQuery } = tourApiSlice;
