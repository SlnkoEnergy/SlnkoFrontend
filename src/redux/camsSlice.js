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
    getBDHandOver: builder.query({
      query: () => "get-all-bd-handoversheet",
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

    updateHandOver: builder.mutation({
      query: (payload) => ({
        url: "edit-hand-over-sheet",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["CAM"],
    }),

    updateUnlockHandoversheet: builder.mutation({
      query: ({ p_id, emp_id }) => ({
        url: "update-status-of-handoversheet",
        method: "PUT",
        body: { p_id, emp_id },
      }),
    }),
  }),
});

export const {
  useGetHandOverQuery,
  useGetBDHandOverQuery,
  useAddHandOverMutation,
  useUpdateHandOverMutation,
  useUpdateUnlockHandoversheetMutation,
} = camsApi;
