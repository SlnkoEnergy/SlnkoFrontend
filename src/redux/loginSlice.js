import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    if (token) headers.set("x-auth-token", token);
    return headers;
  },
});

// small helper to normalize various API shapes to an array of users
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
  // include both to avoid breaking anything that relied on "Login"
  tagTypes: ["Login", "User"],
  endpoints: (builder) => ({
    getLogins: builder.query({
      query: () => "get-all-useR-IT",
      // provide a LIST tag and one tag per user so edits invalidate properly
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
        url: "logiN-IT",
        method: "POST",
        body: newLogin,
      }),
      // new user likely changes the list
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
