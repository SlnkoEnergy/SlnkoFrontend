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

    getWonLeads: builder.query({
      query: () => "get-all-won-lead",
      providesTags: ["Lead"],
    }),
    getWarmLeads: builder.query({
      query: () => "get-all-warm",
      providesTags: ["Lead"],
    }),

    getFollowupLeads: builder.query({
      query: () => "get-all-followup-lead",
      providesTags: ["Lead"],
    }),

    getDeadLeads: builder.query({
      query: () => "get-all-dead-lead",
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

    addInitialtoFollowup: builder.mutation({
      query: (newFollowup) => ({
        url: "initial-to-followup",
        method: "POST",
        body: newFollowup,
      }),
      invalidatesTags: ["Lead"],
    }),
    addInitialtoWarmup: builder.mutation({
      query: (newWarmup) => ({
        url: "inital-to-warmup",
        method: "POST",
        body: newWarmup,
      }),
      invalidatesTags: ["Lead"],
    }),
    addInitialtoDead: builder.mutation({
      query: (newDead) => ({
        url: "inital-to-dead",
        method: "POST",
        body: newDead,
      }),
      invalidatesTags: ["Lead"],
    }),
    addInitialtoWon: builder.mutation({
      query: (newWon) => ({
        url: "initial-to-won",
        method: "POST",
        body: newWon,
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

    updateInitial: builder.mutation({
      query: (newInitial) => ({
        url: "update-inital",
        method: "PUT",
        body: newInitial,
      }),
      invalidatesTags: ["Lead"],
    }),
    updateFollowup: builder.mutation({
      query: (newFollowup2) => ({
        url: "update-followup",
        method: "PUT",
        body: newFollowup2,
      }),
      invalidatesTags: ["Lead"],
    }), 
    updateWarm: builder.mutation({
      query: (newWarm) => ({
        url: "update-warm",
        method: "PUT",
        body: newWarm,
      }),
      invalidatesTags: ["Lead"],
    }),

  }),
});

export const { 
  useGetLeadsQuery,
  useAddLeadsMutation,
  useUpdateLeadsMutation,
  useGetInitialLeadsQuery,
  useAddInitialtoDeadMutation,
  useGetWarmLeadsQuery,
  useAddInitialtoWarmupMutation,
  useUpdateInitialMutation,
  useUpdateFollowupMutation,
  useUpdateWarmMutation,
  useAddInitialtoWonMutation,
  useAddInitialtoFollowupMutation,
  useGetDeadLeadsQuery,
  useGetFollowupLeadsQuery,
  useGetWonLeadsQuery,
} = leadsApi;
