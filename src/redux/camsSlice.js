import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const camsApi = createApi({
  reducerPath: "camsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
  tagTypes: ["CAM"],
  endpoints: (builder) => ({
    getHandOver: builder.query({
        query: () => "get-all-handover-sheet",
        providesTags: ["CAM"],
      }),


      addHandOver: builder.mutation({
        query: (newHandOver) => ({
          url: "create-hand-over-sheet",
          method: "POST",
          body: newHandOver,
        }),
        invalidatesTags: ["CAM"],
      }),

  }),
});

export const { 
useGetHandOverQuery,
useAddHandOverMutation
} = camsApi;
