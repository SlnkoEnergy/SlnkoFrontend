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

    /*** START ******/
    /*--- initial-to-all ---*/
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

    /*--- followup-to-all ---*/
    addFollowuptoWarmup: builder.mutation({
      query: (newWarmup1) => ({
        url: "followup-to-warm",
        method: "POST",
        body: newWarmup1,
      }),
      invalidatesTags: ["Lead"],
    }),
    addFollowuptoDead: builder.mutation({
      query: (newDead1) => ({
        url: "followup-to-dead",
        method: "POST",
        body: newDead1,
      }),
      invalidatesTags: ["Lead"],
    }),
    addFollowuptoWon: builder.mutation({
      query: (newWon1) => ({
        url: "follow-up-to-won",
        method: "POST",
        body: newWon1,
      }),
      invalidatesTags: ["Lead"],
    }),

    /*--- warmup-to-all ---*/

    addWarmuptoFollowup: builder.mutation({
      query: (newFollowup2) => ({
        url: "warmup-to-followup",
        method: "POST",
        body: newFollowup2,
      }),
      invalidatesTags: ["Lead"],
    }),
    addWarmuptoDead: builder.mutation({
      query: (newDead2) => ({
        url: "warmup-to-dead",
        method: "POST",
        body: newDead2,
      }),
      invalidatesTags: ["Lead"],
    }),
    addWarmuptoWon: builder.mutation({
      query: (newWon2) => ({
        url: "warmup-to-won",
        method: "POST",
        body: newWon2,
      }),
      invalidatesTags: ["Lead"],
    }),

    /*--- dead-to-all ---*/

    addDeadtoInitial: builder.mutation({
      query: (newInitial3) => ({
        url: "dead-to-initial",
        method: "POST",
        body: newInitial3,
      }),
      invalidatesTags: ["Lead"],
    }),
    addDeadtoWarmup: builder.mutation({
      query: (newWarmup3) => ({
        url: "dead-to-warm",
        method: "POST",
        body: newWarmup3,
      }),
      invalidatesTags: ["Lead"],
    }),
    addDeadtoFollowup: builder.mutation({
      query: (newFollowup3) => ({
        url: "dead-to-followup",
        method: "POST",
        body: newFollowup3,
      }),
      invalidatesTags: ["Lead"],
    }),

    /*** End ******/

    updateLeads: builder.mutation({
      query: ({ _id, updatedLead }) => ({
        url: `edit-initial-bd-lead/${_id}`,
        method: "PUT",
        body: updatedLead,
      }),
      invalidatesTags: ["Lead"],
    }),
    updateFollowupLeads: builder.mutation({
      query: ({ _id, updatedLead }) => ({
        url: `edit-followup/${_id}`,
        method: "PUT",
        body: updatedLead,
      }),
      invalidatesTags: ["Lead"],
    }),
    updateWARMupLeads: builder.mutation({
      query: ({ _id, updatedLead }) => ({
        url: `edit-warm/${_id}`,
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

    /*-- HandOver Sheet */
    getModuleMaster: builder.query({
      query: () => "get-module-master",
      providesTags: ["Lead"],
    }),
    getMasterInverter: builder.query({
      query: () => "get-master-inverter",
      providesTags: ["Lead"],
    }),
    addHandOver: builder.mutation({
      query: (newHandOver) => ({
        url: "create-hand-over-sheet",
        method: "POST",
        body: newHandOver,
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
  useUpdateFollowupLeadsMutation,
  useUpdateWARMupLeadsMutation,
  useUpdateFollowupMutation,
  useUpdateWarmMutation,
  useAddInitialtoWonMutation,
  useAddInitialtoFollowupMutation,
  useGetDeadLeadsQuery,
  useGetFollowupLeadsQuery,
  useGetWonLeadsQuery,
  useAddFollowuptoDeadMutation,
  useAddFollowuptoWarmupMutation,
  useAddFollowuptoWonMutation,
  useAddDeadtoFollowupMutation,
  useAddDeadtoInitialMutation,
  useAddDeadtoWarmupMutation,
  useAddWarmuptoDeadMutation,
  useAddWarmuptoFollowupMutation,
  useAddWarmuptoWonMutation,
  useAddHandOverMutation,
  useGetMasterInverterQuery,
  useGetModuleMasterQuery
} = leadsApi;
