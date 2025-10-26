import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) headers.set("x-auth-token", token);
      return headers;
    },
  }),
  tagTypes: ["Products", "Categories"],
  endpoints: (builder) => ({
    // ===== Products =====
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

    getProductById: builder.query({
      query: (productId) => `products/product/${productId}`,
      providesTags: (_res, _err, productId) => [
        { type: "Products", id: productId },
      ],
    }),

    createProduct: builder.mutation({
      query: ({ category, data, description, is_available }) => ({
        url: "products/product",
        method: "POST",
        body: { category, data, description, is_available },
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, category, data, description, is_available }) => ({
        url: `products/product/${productId}`,
        method: "PUT",
        body: { category, data, description, is_available },
      }),
      invalidatesTags: (_res, _err, { productId }) => [
        { type: "Products", id: "LIST" },
        { type: "Products", id: productId },
      ],
    }),

    getPurchaseOrderPdf: builder.query({
      query: ({ po_number, _id }) => {
        const params = new URLSearchParams();
        if (po_number) params.set("po_number", po_number);
        if (_id) params.set("_id", _id);

        return {
          url: `/purchase-generate-pdf?${params.toString()}`,
          method: "POST",
          // VERY IMPORTANT: parse as Blob (PDF)
          responseHandler: (response) => response.blob(),
        };
      },
    }),

    // ===== Categories =====
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
      providesTags: (result) =>
        result?.data
          ? [
              { type: "Categories", id: "LIST" },
              ...result.data.map((c) => ({ type: "Categories", id: c._id })),
            ]
          : [{ type: "Categories", id: "LIST" }],
    }),

    getCategoriesNameSearch: builder.query({
      query: ({ page, search, pr, projectId }) =>
        `products/category?search=${search}&page=${page}&pr=${pr}&project_id=${projectId}`,
      providesTags: [{ type: "Categories", id: "LIST" }],
    }),

    getMaterialCategoryById: builder.query({
      query: (categoryId) => ({
        url: `products/category-id?id=${categoryId}`,
        method: "GET",
        params: { id: categoryId },
      }),
      providesTags: (_res, _err, categoryId) => [
        { type: "Categories", id: categoryId },
      ],
    }),

    updateCategories: builder.mutation({
      query: ({ categoryId, body }) => ({
        url: `products/category/${categoryId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { categoryId }) => [
        { type: "Categories", id: "LIST" },
        { type: "Categories", id: categoryId },
      ],
    }),

    createCategory: builder.mutation({
      query: ({ name, description, type, status, fields }) => ({
        url: "products/category",
        method: "POST",
        body: { name, description, type, status, fields },
      }),
      invalidatesTags: [{ type: "Categories", id: "LIST" }],
    }),

    getAllMaterialsPO: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `/engineering/all-materials-po?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}`,
      providesTags: [{ type: "Categories", id: "LIST" }],
    }),

    getAllProdcutPO: builder.query({
      query: ({ page = 1, pageSize = 10, search = "", categoryId = "" }) =>
        `/engineering/all-product-po?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
          search
        )}&categoryId=${encodeURIComponent(categoryId)}`,
      providesTags: [{ type: "Products", id: "LIST" }],
    }),
  }),
});

export const {
  // products
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetPurchaseOrderPdfQuery,
  useLazyGetPurchaseOrderPdfQuery,

  // categories
  useGetAllCategoriesQuery,
  useGetCategoriesNameSearchQuery,
  useLazyGetCategoriesNameSearchQuery,
  useGetMaterialCategoryByIdQuery,
  useUpdateCategoriesMutation,
  useCreateCategoryMutation,
  useGetAllMaterialsPOQuery,
  useLazyGetAllMaterialsPOQuery,
  useGetAllProdcutPOQuery,
  useLazyGetAllProdcutPOQuery,
} = productsApi;
