import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/`,
  credentials: "include", 
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
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
    verifyOtp: builder.mutation({
      query: (otpPayload) => ({
        url: "verifyOtp",
        method: "POST",
        body: otpPayload,
      }),
    }),
    addEmail: builder.mutation({
      query: (newEmail) => ({
        url: "sendOtp",
        method: "POST",
        body: newEmail,
      }),
      invalidatesTags: ["Login"],
    }),
    resetPassword: builder.mutation({
      query: (payload) => ({
        url: "resetPassword",
        method: "POST",
        body: payload,
      }),
    }),
    finalizeBDlogin: builder.mutation({
      query: (payload) => ({
        url: "session-verify",
        method: "POST",
        body: payload,
      }),
    }),
    getUserById: builder.query({
      query: (userId) => `get-single-useR-IT/${userId}`,
      providesTags:("Login"),
    })
  }),
});
export const {
  useGetLoginsQuery,
  useAddEmailMutation,
  useAddLoginsMutation,
  // useAddForgetPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useFinalizeBDloginMutation,
  useGetUserByIdQuery
} = loginsApi;
