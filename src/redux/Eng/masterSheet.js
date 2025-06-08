import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://dev.api.slnkoprotrac.com/v1/engineering",
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
})
});

export const {
  useCreateMaterialCategoryMutation,
  useGetAllMaterialCategoryQuery,
} = masterSheetApi;