import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

// Browser calls hit relative /api/v1/... paths.
// next.config.mjs rewrites /api/:path* → API_BASE_URL/api/:path*
// so the browser stays same-origin and the httpOnly cookie just works.

const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api/v1",
  credentials: "include",
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  // if there is a refresh process running right now, wait for it to finish
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === "string" ? args : args.url;

  const isAuthRoute =
    url === "/users/login" ||
    url === "/users/signup" ||
    url === "/users/refreshToken";

  if (result.error?.status === 401 && !isAuthRoute) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshResult = await rawBaseQuery(
          { url: "/users/refreshToken", method: "POST" },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // the backend put the new accessToken as an httpOnly cookie automatically
          result = await rawBaseQuery(args, api, extraOptions);
        }
      } finally {
        release();
      }
    } else {
      // another request reached here at the same time - wait for the refresh to finish
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Tour", "Booking", "Review"],
  endpoints: () => ({}),
});

export default apiSlice;