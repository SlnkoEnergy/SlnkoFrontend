import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/engineering`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    // console.log("Token:", token);
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});

export const masterSheetApi = createApi({
  reducerPath: "masterSheetApi",
  baseQuery,
  tagTypes: ["MasterSheet"],
  endpoints: (builder) => ({
    // POST: Create new Material Category
    createMaterialCategory: builder.mutation({
      query: (newCategory) => ({
        url: "create-material-category",
        method: "POST",
        body: newCategory,
      }),
  }),
  // GET: Fetch all Material Categories
  getAllMaterialCategory: builder.query({
      query: () => "all-material-category",
      providesTags: ["MasterSheet"],
    }),

  getMaterialCategory: builder.query({
    query: (_id) => `material-category-id?id=${_id}`,
    providesTags:["MasterSheet"]
  }),
   createMaterial: builder.mutation({
    query: (newMaterial) => ({
      url: "create-material",
      method:"POST",
      body: newMaterial
    })
   }),
   getAllMaterial: builder.query({
    query: (category) => `all-materials?category=${category}`,
    providesTags:["MasterSheet"]
   })
})
});

export const {
  useCreateMaterialCategoryMutation,
  useGetAllMaterialCategoryQuery,
  useGetMaterialCategoryQuery,
  useCreateMaterialMutation,
  useGetAllMaterialQuery
} = masterSheetApi;