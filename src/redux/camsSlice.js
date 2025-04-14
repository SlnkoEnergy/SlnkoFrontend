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

      updateHandOver: builder.mutation({
        query: ({ p_id, updatedHandOver }) => ({
          url: "edit-hand-over-sheet",
          method: "PUT",
          body: updatedHandOver,
        }),
        invalidatesTags: ["CAM"],
      }),

  }),
});

export const { 
useGetHandOverQuery,
useAddHandOverMutation,
useUpdateHandOverMutation,
} = camsApi;
