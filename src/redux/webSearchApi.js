// Need to use the React-specific entry point to allow generating React hooks
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const webSearchApi = createApi({
  reducerPath: "webSearchApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://google.serper.dev/", // Serper API base URL
    prepareHeaders: (headers) => {
      headers.set("X-API-KEY", import.meta.env.VITE_WEB_SEARCH_API_KEY); // Replace with your API Key
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    searchGoogle: builder.mutation({
      query: (searchQuery) => ({
        url: "search",
        method: "POST",
        body: { q: searchQuery },
      }),
    }),
  }),
});

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const { useSearchGoogleMutation } = webSearchApi;
