import apiSlice from "@/api/apiSlice";

const reviewApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getMyReviews: builder.query({
      query: () => "/reviews/my-reviews",
      providesTags: ["Review"],
    }),
    addReview: builder.mutation({
      query: ({tourId, review }) => ({
        url: `/tours/${tourId}/reviews`,
        method: "POST",
        body: review,
      }),
      invalidatesTags: ["Tour", "Review"]
    }),
    updateReview: builder.mutation({
      query: ({ id, review }) => ({
        url: `/reviews/${id}`,
        method: "PATCH",
        body: review,
      }),
      invalidatesTags: ["Tour", "Review"]
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tour", "Review"]
    }),
  }),
});

export const { 
  useGetMyReviewsQuery, 
  useAddReviewMutation, 
  useUpdateReviewMutation, 
  useDeleteReviewMutation 
} = reviewApiSlice;