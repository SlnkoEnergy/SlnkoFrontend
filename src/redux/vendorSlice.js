import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const vendorsApi = createApi({
  reducerPath: "vendorsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("x-auth-token", token);
      }

      return headers;
    },
  }),
  tagTypes: ["Vendors"],
  endpoints: (builder) => ({
    getAllVendors: builder.query({
      query: ({ page, limit, search }) =>
        `/vendor/vendors?page=${page}&limit=${limit}&search=${search}`,
      providesTags: (result) =>
        result?.data
          ? [
              { type: "Vendors", id: "LIST" },
              ...result.data.map((p) => ({ type: "Vendors", id: p._id })),
            ]
          : [{ type: "Vendors", id: "LIST" }],
    }),
    getVendorsNameSearch: builder.query({
      query: ({ limit, search, page }) =>
        `/vendor-search?search=${search}&limit=${limit}&page=${page}`,
      providesTags: (result) =>
        result?.data
          ? [
              { type: "Vendors", id: "LIST" },
              ...result.data.map((p) => ({ type: "Products", id: p._id })),
            ]
          : [{ type: "Vendors", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllVendorsQuery,
  useGetVendorsNameSearchQuery,
  useLazyGetVendorsNameSearchQuery,
} = vendorsApi;
