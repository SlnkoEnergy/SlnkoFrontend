import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../auth/auth_variable";


export const engsBOSApi = createApi({
  reducerPath: "engsBOSApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}/`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");

      if (token) {
        headers.set("x-auth-token", token);
      }

      return headers;
    },
  }),
  tagTypes: ["BOS"],
  endpoints: (builder) => ({
    getBOS: builder.query({
      query: () => "get-bos-master",
      providesTags: ["BOS"],
    }),
    addBOS: builder.mutation({
      query: (addBOS) => ({
        url: "/add-bos-master",
        method: "POST",
        body: addBOS,
      }),
      invalidatesTags: ["BOS"],
    }),
  }),
});

export const {
  useAddBOSMutation,
  useGetBOSQuery,
} = engsBOSApi;
