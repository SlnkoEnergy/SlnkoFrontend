import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, getAuthToken } from "./auth/auth_variable";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const token = getAuthToken();
    // console.log("Token:", token);
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});
export const loginsApi = createApi({
  reducerPath: "loginsApi",
  baseQuery,
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

    resetPassword: builder.mutation({
      query: (payload) => ({
        url: "reset-password-IT",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetLoginsQuery,
  useAddEmailMutation,
  useAddLoginsMutation,
  useAddForgetPasswordMutation,
  useResetPasswordMutation

} = loginsApi;
