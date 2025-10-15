import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const vendorsApi = createApi({
  reducerPath: "vendorsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Vendors"],
  endpoints: (builder) => ({
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
  useGetVendorsNameSearchQuery,
  useLazyGetVendorsNameSearchQuery,
} = vendorsApi;
