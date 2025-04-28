import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const engsLTPanelApi = createApi({
  reducerPath: "engsLTPanelApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
  tagTypes: ["LTPanel"],
  endpoints: (builder) => ({
    getLTPanels: builder.query({
      query: () => "get-ltpanel-master",
      providesTags: ["LTPanel"],
      
    }),
    addLTPanel: builder.mutation({
      query: (addLTPanel) => ({
        url: "/add-ltpanel-master",
        method: "POST",
        body: addLTPanel,
      }),
      invalidatesTags: ["LTPanel"],
    }),
    // getTasksHistory: builder.query({
    //   query: () => "get-task-history",
    //   providesTags: ["Task"],
      
    // }),
  }),
});

export const {
useAddLTPanelMutation,
useGetLTPanelsQuery
} = engsLTPanelApi;

