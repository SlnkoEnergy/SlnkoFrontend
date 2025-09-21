import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});

export const approvalsApi = createApi({
  reducerPath: "approvalsApi",
  baseQuery,
  tagTypes: ["Approval"],
  endpoints: (builder) => ({
    getUniqueModel: builder.query({
      query: () => 'approvals/uniquemodels',
      providesTags: ["Approval"],
    }),
})
});

export const{
    useGetUniqueModelQuery
} = approvalsApi