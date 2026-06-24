import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Browser calls hit relative /api/v1/... paths.
// next.config.mjs rewrites /api/:path* → API_BASE_URL/api/:path*
// so the browser stays same-origin and the httpOnly cookie just works.
const baseQuery = fetchBaseQuery({
  baseUrl: "/api/v1",
  credentials: "include",
});

const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["User", "Tour", "Booking", "Review"],
  endpoints: () => ({}),
});

export default apiSlice;