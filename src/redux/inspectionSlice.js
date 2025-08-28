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
      query: ({ page, limit, search, startDate, endDate, po_number }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        params.set("search", search ?? "");
        params.set("po_number", String(po_number))

        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        

        return `inspection?${params.toString()}`;
      },
      providesTags: ["Inspection"],
    }),
    getInspectionById: builder.query({
      query: ({ id }) => `inspection/${id}`,
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
      query: ({ data, id }) => ({
        url: `inspection/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Inspection"],
    }),
    deleteInspection: builder.mutation({
      query: ({ id }) => ({
        url: `inspection/${id}`,
        method: "Delete",
      }),
      invalidatesTags: ["Inspection"],
    }),
    updateStatusInspection: builder.mutation({
      query: ({ id, status, remarks, files }) => {
        const form = new FormData();
        form.append("status", status ?? "");
        form.append("remarks", remarks ?? "");
        (files || []).forEach((file) => form.append("files", file));

        return {
          url: `/${id}/updateStatus`,
          method: "PUT",
          body: form,
        };
      },
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
  useUpdateStatusInspectionMutation,
} = inspectionApi;
