import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import apiSlice from "../api/apiSlice";

// Import slices so their endpoints are injected into apiSlice before the
// store is created. (injectEndpoints is called at module evaluation time.)
import "../features/authSlice";
import "../features/tourSlice";
import "../features/userSlice";
import "../features/bookingSlice";

export const store = configureStore({
  reducer: {
    // All RTK Query cache lives under the single "api" key
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Enables refetchOnFocus / refetchOnReconnect behaviours
setupListeners(store.dispatch);