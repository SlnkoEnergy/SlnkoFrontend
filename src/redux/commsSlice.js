import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


const baseQuery = fetchBaseQuery({
  baseUrl: "https://dev.api.slnkoprotrac.com/v1/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    console.log("Token:", token);
    if (token) {
      headers.set("x-auth-token", token); // ✅ Match backend expectation
    }
    return headers;
  },
});

export const commsApi = createApi({
  reducerPath: "commsApi",
  baseQuery,
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
