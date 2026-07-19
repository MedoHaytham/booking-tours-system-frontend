// features/favoriteSlice.js
//
// RTK Query endpoints for favorite tours.
//
// Endpoints:
//   GET  /api/v1/favorites          → list of user's favorite tours
//   POST /api/v1/favorites          → toggle favorite state (body: { tourId })

import apiSlice from "../api/apiSlice";

const favoriteApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ── Get all favorites of the current user ─────────────────────────────
    getMyFavorites: builder.query({
      query: () => "/favorites",
      providesTags: ["Favorite"],
    }),

    // ── Toggle favorite status for a tour ─────────────────────────────────
    toggleFavorite: builder.mutation({
      query: (tourId) => ({
        url: `/favorites/${tourId}`,
        method: "POST",
      }),
      invalidatesTags: ["Favorite"],
    }),
  }),
});

export const {
  useGetMyFavoritesQuery,
  useToggleFavoriteMutation,
} = favoriteApiSlice;
