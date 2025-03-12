import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const leadsApi = createApi({
  reducerPath: "leadsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
  tagTypes: ["Lead"],
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: () => "get-all-bd-lead",
      providesTags: ["Lead"],
    }),
    getInitialLeads: builder.query({
      query: () => "get-all-inital-bd-lead",
      providesTags: ["Lead"],
    }),
    addLeads: builder.mutation({
      query: (newLead) => ({
        url: "create-bd-lead",
        method: "POST",
        body: newLead,
      }),
      invalidatesTags: ["Lead"],
    }),
    updateLeads: builder.mutation({
      query: ({ _id, updatedLead }) => ({
        url: `edit-initial-bd-lead/${_id}`,
        method: "PUT",
        body: updatedLead,
      }),
      invalidatesTags: ["Lead"],
    }),

  }),
});

export const { 
  useGetLeadsQuery,
  useAddLeadsMutation,
  useUpdateLeadsMutation,
  useGetInitialLeadsQuery
} = leadsApi;
