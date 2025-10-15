import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_LOGIN_URL}/users`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const normalizeUsers = (result) => {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.data)) return result.data;
  return [];
};

export const loginsApi = createApi({
  reducerPath: "loginsApi",
  baseQuery,
  tagTypes: ["Login", "User"],
  endpoints: (builder) => ({
    getLogins: builder.query({
      query: () => "get-all-useR-IT",
      providesTags: (result) => {
        const list = normalizeUsers(result);
        return [
          { type: "User", id: "LIST" },
          ...list
            .filter((u) => u && (u._id || u.id))
            .map((u) => ({ type: "User", id: u._id ?? u.id })),
        ];
      },
    }),

    addLogins: builder.mutation({
      query: (newLogin) => ({
        url: "/login",
        method: "POST",
        body: newLogin,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }, "Login"],
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
      providesTags: (result, error, userId) => [
        { type: "User", id: userId },
      ],
    }),

    // EDIT USER — after success, invalidate the specific user and the LIST
    editUser: builder.mutation({
      query: ({ userId, body }) => ({
        url: `edit-user/${userId}`,
        method: "PUT",
        body, // can be plain JSON or FormData
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetLoginsQuery,
  useAddEmailMutation,
  useAddLoginsMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useFinalizeBDloginMutation,
  useGetUserByIdQuery,
  useEditUserMutation,
} = loginsApi;
