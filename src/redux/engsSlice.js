import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});

export const engsApi = createApi({
  reducerPath: "engsApi",
  baseQuery,
  tagTypes: ["Eng"],
  endpoints: (builder) => ({
    addEng: builder.mutation({
      query: (addBOM) => ({
        url: "/add-bom-master",
        method: "POST",
        body: addBOM,
      }),
      invalidatesTags: ["Eng"],
    }),
  }),
});

export const { useAddEngMutation } = engsApi;
