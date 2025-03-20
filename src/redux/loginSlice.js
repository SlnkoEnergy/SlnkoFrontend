import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const loginsApi = createApi({
  reducerPath: "loginsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
  tagTypes: ["Login"],
  endpoints: (builder) => ({
    getLogins: builder.query({
      query: () => "get-all-useR-IT",
      providesTags: ["Login"],
      
    }),
   
    addLogins: builder.mutation({
      query: (newLogin) => ({
        url: "logiN-IT",
        method: "POST",
        body: newLogin,
      }),
      invalidatesTags: ["Login"],
    }),

    addForgetPassword: builder.mutation({
        query: (newForget) => ({
          url: "forget-password-send-otP-IT",
          method: "POST",
          body: newForget,
        }),
        invalidatesTags: ["Login"],
      }),

      addEmail: builder.mutation({
        query: (newEmail) => ({
          url: "received-emaiL-IT",
          method: "POST",
          body: newEmail,
        }),
        invalidatesTags: ["Login"],
      }),
   
  }),
});

export const { 
 useGetLoginsQuery,
 useAddEmailMutation,
 useAddLoginsMutation,
 useAddForgetPasswordMutation,
} = loginsApi;

