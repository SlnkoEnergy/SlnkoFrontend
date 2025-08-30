import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApi = createApi({
  reducerPath: "productsApi",
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
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ limit, search, page, category }) =>
        `products/product?search=${search}&limit=${limit}&page=${page}&category=${category}`,
      providesTags: (result) =>
        result?.data
          ? [
              { type: "Products", id: "LIST" },
              ...result.data.map((p) => ({ type: "Products", id: p._id })),
            ]
          : [{ type: "Products", id: "LIST" }],
    }),
    getCategoriesNameSearch: builder.query({
      query: ({ page, search, limit, pr, projectId }) =>
        `products/category?search=${search}&page=${page}&pr=${pr}&project_id=${projectId}`,
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
    getAllCategories: builder.query({
      query: ({
        page = 1,
        pageSize = 10,
        search = "",
        type = "",
        status = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      }) =>
        `products/categories?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
          search
        )}&type=${type}&status=${status}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      providesTags: ["Products"],
    }),
    updateCategories: builder.mutation({
      query: ({ categoryId, body }) => ({
        url: `products/category/${categoryId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Products"],
    }),
   getMaterialCategoryById: builder.query({
      query: (categoryId) => ({
        url: `products/category-id?id=${categoryId}`, 
        method: 'GET',
        params: { id: categoryId },  
      }),
      providesTags: ['Products'],
    }),
  }),

  });


export const {
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetCategoriesNameSearchQuery,
  useLazyGetCategoriesNameSearchQuery,
  useCreateProductMutation,
  useLazyGetProductByIdQuery,
  useUpdateProductMutation,
  useGetAllCategoriesQuery,
  useUpdateCategoriesMutation,
  useGetMaterialCategoryByIdQuery
} = productsApi;
