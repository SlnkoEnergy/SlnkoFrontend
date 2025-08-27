import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const inspectionApi = createApi({
  reducerPath: "inspectionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}/inspection/`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");

      if (token) {
        headers.set("x-auth-token", token);
      }

      return headers;
    },
  }),
  tagTypes: ["Inspection"],
  endpoints: (builder) => ({
    getInspections: builder.query({
      query: ({page, limit, search}) => `inspection/page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["Inspection"],
    }),
    getInspectionById: builder.query({
      query: ({id}) => `inspection/${id}`,
      providesTags: ["Inspection"],
    }),
    addInspection: builder.mutation({
      query: (newInspection) => ({
        url: "inspection",
        method: "POST",
        body: newInspection,
      }),
      invalidatesTags: ["Inspection"],
    }),
    updateInspection: builder.mutation({
      query: ({data, id}) => ({
        url: `inspection/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Inspection"],
    }),
    deleteInspection: builder.mutation({
      query: ({id}) => ({
        url: `inspection/${id}`,
        method: "Delete",
      }),
      invalidatesTags: ["Inspection"],
    }),
  }),
});

export const {
  useGetInspectionByIdQuery,
  useGetInspectionsQuery,
  useAddInspectionMutation,
  useUpdateInspectionMutation,
  useDeleteInspectionMutation,
} = inspectionApi;
