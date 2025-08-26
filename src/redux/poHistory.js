import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const poHistoryApi = createApi({
  reducerPath: "poHistoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}/`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");

      if (token) {
        headers.set("x-auth-token", token);
      }

      return headers;
    },
  }),
  tagTypes: ["Pohistory"],
  endpoints: (builder) => ({
   getPoHistory: builder.query({
  query: ({ subject_type, subject_id }) => {
    const params = new URLSearchParams({
      subject_type,
      subject_id,
    });

    return `/history/Pohistory?${params.toString()}`;
  },
  providesTags: ["Pohistory"],
}),

    addPoHistory: builder.mutation({
      query: (newHistory) => ({
        url: "/history/PoHistory",
        method: "POST",
        body: newHistory,
      }),
      invalidatesTags: ["Pohistory"],
    }),
  }),
});

export const { useLazyGetPoHistoryQuery, useAddPoHistoryMutation } = poHistoryApi;
