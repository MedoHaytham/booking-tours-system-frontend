// features/tourSlice.js
//
// RTK Query endpoints for tour data (client-side use only).
//
// Endpoints:
//   GET    /api/v1/tours                    → list of all tours
//   GET    /api/v1/tours/slug/:slug         → single tour by slug (with guides + reviews)
//   GET    /api/v1/tours?search=...&page=   → paginated + searchable (admin)
//   DELETE /api/v1/tours/:id               → delete tour (admin)
//   PATCH  /api/v1/tours/:id               → update tour (admin)

import apiSlice from "../api/apiSlice";

const tourApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ── All tours (public) ────────────────────────────────────────────────
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
    getTourBySlug: builder.query({
      query: (slug) => `/tours/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Tour", id: slug }],
    }),

    // ── Admin: paginated + searchable list ────────────────────────────────
    getAdminTours: builder.query({
      query: (params) => ({
        url: "/tours",
        params,
      }),
      providesTags: ["Tour"],
    }),

    // ── Admin: Create tour ────────────────────────────────────────────────
    createTour: builder.mutation({
      query: (body) => ({
        url: "/tours",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tour"],
    }),

    // ── Admin: Create tour start date ──────────────────────────────────────
    createTourStartDate: builder.mutation({
      query: ({ id, body }) => ({
        url: `/tours/${id}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tour"],
    }),

    // ── Admin: Delete tour start date ──────────────────────────────────────
    deleteTourStartDate: builder.mutation({
      query: ({ id, startDateId }) => ({
        url: `/tours/${id}/startDates/${startDateId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tour"],
    }),

    // ── Admin: Update tour start date ──────────────────────────────────────
    updateTourStartDate: builder.mutation({
      query: ({ id, startDateId, body }) => ({
        url: `/tours/${id}/startDates/${startDateId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Tour"],
    }),

    // ── Admin: Delete tour ────────────────────────────────────────────────
    deleteTour: builder.mutation({
      query: (id) => ({
        url: `/tours/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tour"],
    }),

    // ── Admin: Update tour (metadata + optional images via FormData) ─────────
    updateTour: builder.mutation({
      query: ({ id, body }) => ({
        url: `/tours/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Tour"],
    }),
    // ── Get Tour Stats ───────────────────────────────────────────────────
    getTourStats: builder.query({
      query: () => "/tours/stats",
      providesTags: ["Tour"],
    }),
  }),
});

export const {
  useGetAllToursQuery,
  useGetTourBySlugQuery,
  useGetAdminToursQuery,
  useCreateTourMutation,
  useCreateTourStartDateMutation,
  useDeleteTourMutation,
  useUpdateTourMutation,
  useGetTourStatsQuery,
} = tourApiSlice;
