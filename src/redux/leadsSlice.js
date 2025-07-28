import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// const baseQuery = fetchBaseQuery({
//   baseUrl: "${process.env.REACT_APP_API_URL}/",
//   prepareHeaders: (headers) => {
//     const token = localStorage.getItem("authToken");
//     console.log("Token:", token);
//     if (token) {
//       headers.set("x-auth-token", token);
//     }
//     return headers;
//   },
// });
export const leadsApi = createApi({
  reducerPath: "leadsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}/`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      // console.log(token);
      if (token) {
        headers.set("x-auth-token", token);
      }

      return headers;
    },
  }),
  tagTypes: ["Lead"],
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: () => "get-all-bd-lead",
      providesTags: ["Lead"],
      // keepUnusedDataFor: 120,
      // refetchOnMountOrArgChange: true,
      // pollingInterval: 5000,
    }),
    getEntireLeads: builder.query({
      query: () => "get-all-lead",
      providesTags: ["Lead"],
      keepUnusedDataFor: 300,
      refetchOnMountOrArgChange: true,
      pollingInterval: 5000,
    }),
    getEntireWonLeadsProjects: builder.query({
      query: () => "all-leads-won-projects",
      providesTags: ["Lead"],
      keepUnusedDataFor: 300,
      refetchOnMountOrArgChange: true,
      pollingInterval: 5000,
    }),
    getInitialLeads: builder.query({
      query: () => "get-initial-bd-lead-streams",
      providesTags: ["Lead"],
      keepUnusedDataFor: 120,
      refetchOnMountOrArgChange: true,
      pollingInterval: 5000,
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

    /*--- Won-to-all ---*/

    addWontoDead: builder.mutation({
      query: (newDead3) => ({
        url: "won-to-dead",
        method: "POST",
        body: newDead3,
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
    addDeadtoWon: builder.mutation({
      query: (newDead4) => ({
        url: "dead-to-won",
        method: "POST",
        body: newDead4,
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
    updateWONLeads: builder.mutation({
      query: ({ _id, updatedLead }) => ({
        url: `edit-won/${_id}`,
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
      query: (newFollowup5) => ({
        url: "update-followup",
        method: "PUT",
        body: newFollowup5,
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
    updateWon: builder.mutation({
      query: (newWon3) => ({
        url: "update-won",
        method: "PUT",
        body: newWon3,
      }),
      invalidatesTags: ["Lead"],
    }),

    updateTaskComment: builder.mutation({
      query: ({ _id, comment }) => ({
        url: `edit-comment/${_id}`, // Ensure id is used correctly
        method: "PUT",
        body: { comment }, // Send the comment inside an object
      }),
      invalidatesTags: ["Lead"],
    }),

    getWonDataById: builder.query({
      query: ({ leadId }) => `/get-won?leadId=${leadId}`,
      providesTags: ["CAM"],
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
    // getHandOver: builder.query({
    //   query: () => "get-all-handover-sheet",
    //   providesTags: ["Lead"],
    // }),
    // addHandOver: builder.mutation({
    //   query: (newHandOver) => ({
    //     url: "create-hand-over-sheet",
    //     method: "POST",
    //     body: newHandOver,
    //   }),
    //   invalidatesTags: ["Lead"],
    // }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetEntireLeadsQuery,
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
  useUpdateWonMutation,
  useUpdateTaskCommentMutation,
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
  useAddWontoDeadMutation,
  useAddDeadtoWonMutation,
  // useAddHandOverMutation,
  useGetMasterInverterQuery,
  useGetModuleMasterQuery,
  useUpdateWONLeadsMutation,
  useGetWonDataByIdQuery,
  // useGetHandOverQuery,
  useGetEntireWonLeadsProjectsQuery
} = leadsApi;
