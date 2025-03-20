import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const commsApi = createApi({
  reducerPath: "commsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
  tagTypes: ["Offer"],
  endpoints: (builder) => ({
    getOffer: builder.query({
      query: () => "get-comm-offer",
      providesTags: ["Offer"],
      
    }),
    getBDOffer: builder.query({
        query: () => "get-comm-bd-rate",
        providesTags: ["Offer"],
        
      }),

    updateOffer: builder.mutation({
      query: ({ _id, updatedOffer }) => ({
        url: `edit-offer/${_id}`,
        method: "PUT",
        body: updatedOffer,
      }),
      invalidatesTags: ["Offer"],
    }),
  }),
});

export const { 
 useGetOfferQuery,
 useGetBDOfferQuery,
 useUpdateOfferMutation
} = commsApi;
