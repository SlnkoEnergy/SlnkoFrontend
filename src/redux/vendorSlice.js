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
    addVendor: builder.mutation({
      query: ({ data, profileFile }) => {
        const form = new FormData();
        if (profileFile) form.append("profile_image", profileFile);
        form.append("data", JSON.stringify(data));
        return {
          url: "/vendor/vendor",
          method: "POST",
          body: form,
        };
      },
      invalidatesTags: [{ type: "Vendors", id: "LIST" }],
    }),
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
    getVendorById: builder.query({
      query: (id) => `/vendor/vendor/${id}`,
      providesTags: (result, error, id) => [{ type: "Vendors", id }],
    }),
    getVendorsNameSearch: builder.query({
      query: ({ limit, search, page }) =>
        `/vendor/vendor-search?search=${search}&limit=${limit}&page=${page}`,
      providesTags: (result) =>
        result?.data
          ? [
              { type: "Vendors", id: "LIST" },
              ...result.data.map((p) => ({ type: "Products", id: p._id })),
            ]
          : [{ type: "Vendors", id: "LIST" }],
    }),
    updateVendor: builder.mutation({
      query: ({ id, data }) => ({
        url: `/vendor/vendor/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Vendors", id },
        { type: "Vendors", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useAddVendorMutation,
  useGetAllVendorsQuery,
  useGetVendorByIdQuery,
  useGetVendorsNameSearchQuery,
  useLazyGetVendorsNameSearchQuery,
  useUpdateVendorMutation,
} = vendorsApi;
