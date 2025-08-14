import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}/`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");

      if (token) {
        headers.set("x-auth-token", token);
      }

      return headers;
    },
  }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ limit, search, page }) =>
        `products/product?search=${search}&limit=${limit}&page=${page}`,
      providesTags: (result) =>
        result?.data
          ? [
              { type: "Products", id: "LIST" },
              ...result.data.map((p) => ({ type: "Products", id: p._id })),
            ]
          : [{ type: "Products", id: "LIST" }],
    }),
    getCategoriesNameSearch: builder.query({
      query: ({ page, search }) =>
        `products/category?search=${search}&page=${page}`,
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation({
      query: ({ category, data, description, is_available }) => ({
        url: "products/product",
        method: "POST",
        body: { category, data, description, is_available },
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
    getProductById: builder.query({
      query: (productId) => `products/product/${productId}`,
      providesTags: ["Products"],
    }),
    updateProduct: builder.mutation({
      query: ({ productId, category, data, description, is_available }) => ({
        url: `products/product/${productId}`,
        method: "PUT",
        body: { category, data, description, is_available },
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetCategoriesNameSearchQuery,
  useLazyGetCategoriesNameSearchQuery,
  useCreateProductMutation,
  useLazyGetProductByIdQuery,
  useUpdateProductMutation,
} = productsApi;
