import apiSlice from "@/api/apiSlice";

const reviewApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getMyReviews: builder.query({
      query: () => "/reviews/my-reviews",
    }),
    addReview: builder.mutation({
      query: (review) => ({
        url: "/reviews",
        method: "POST",
        body: review,
      }),
    }),
    updateReview: builder.mutation({
      query: ({ id, review }) => ({
        url: `/reviews/${id}`,
        method: "PUT",
        body: review,
      }),
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { 
  useGetMyReviewsQuery, 
  useAddReviewMutation, 
  useUpdateReviewMutation, 
  useDeleteReviewMutation 
} = reviewApiSlice;