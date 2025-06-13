import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/engineering/`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    // console.log("Token:", token);
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});

export const templatesApi = createApi({
  reducerPath: "templatesApi",
  baseQuery,
  tagTypes: ["Template"],
  endpoints: (builder) => ({
    // GET: Fetch all Templatess
    getAllTemplates: builder.query({
      query: () => "get-module",
      providesTags: ["Template"],
    }),

    // GET: Fetch single Templates by ID
    getTemplatesById: builder.query({
      query: (_id) => `get-module-by-id/${_id}`,
      providesTags: ["Template"],
    }),

    // POST: Create new Templates
    addTemplates: builder.mutation({
      query: (newTemplates) => ({
        url: "create-module",
        method: "POST",
        body: newTemplates,
      }),
      invalidatesTags: ["Template"],
    }),

    // PUT: Update overall status by _id
    updateTemplatesStatusOverall: builder.mutation({
      query: ({ _id, ...data }) => ({
        url: `/${_id}/status/overall`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Template"],
    }),

    // PUT: Update status of an item in a specific sheet
    updateTemplatesStatusItems: builder.mutation({
      query: ({ sheetId, itemId, ...data }) => ({
        url: `${sheetId}/item/${itemId}/status`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Template"],
    }),

    // POST: Step 1 - Create BOQ Category (template with headers) ?$module_Template
    createBoqCategory: builder.mutation({
      query: ({ categoryData, module_template }) => ({
        url: `create-boq-category?module_template=${module_template}`,
        method: "POST",
        body: categoryData,
      }),
      invalidatesTags: ["Template"],
    }),

    // POST: Step 2 - Create BOQ Template Row
    createBoqTemplateRow: builder.mutation({
      query: (rowData) => ({
        url: "create-boq-template",
        method: "POST",
        body: rowData,
      }),
      invalidatesTags: ["Template"],
    }),

    // GET: Fetch all BOQ Categories
    getAllBoqCategories: builder.query({
      query: () => "get-boq-category",
      providesTags: ["Template"],
    }),

    // GET: Fetch all BOQ Templates
    getAllBoqTemplates: builder.query({
      query: () => "get-boq-template",
      providesTags: ["Template"],
    }),

    // DELETE: Delete an Templates
    deleteTemplates: builder.mutation({
      query: (_id) => ({
        url: `delete-module/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Template"],
    }),

    updateTemplatesSheet: builder.mutation({
      query: ({ _id, ...updatedData }) => ({
        url: `update-module/${_id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Template"],
    }),

    updateModuleTemplateId: builder.mutation({
      query: ({ _id, template_category }) => ({
        url: `update-template-category/${_id}`,
        method: "PUT",
        body: { template_category },
      }),
      invalidatesTags: ["Template"],
    }),

    getModuleCategoryById: builder.query({
      query: ({ projectId, engineering }) =>
        `get-module-category-id?projectId=${projectId}&engineering=${engineering}`,
      providesTags: ["Template"],
    }),

    updateModuleCategory: builder.mutation({
      query: ({ formData, projectId }) => ({
        url: `update-module-category?projectId=${projectId}`,
        method: "PUT",
        body: formData,
      }),
    }),
    updateModuleTemplateStatus: builder.mutation({
      query: ({ projectId, moduleTemplateId, statusData }) => ({
        url: `${projectId}/moduletemplate/${moduleTemplateId}/statusModule`,
        method: "PUT",
        body: statusData,
      }),
      invalidatesTags: ["Template"],
    }),

    getBoqProject: builder.query({
      query: ({ projectId, module_template }) =>
        `get-boq-project-by-id?projectId=${projectId}&module_template=${module_template}`,
      providesTags: ["Template"],
    }),
    updateBoqProject: builder.mutation({
      query: ({ data, projectId, module_template }) => ({
        url: `${projectId}/moduletemplate/${module_template}/updateBoqProject`,
        method: "PUT",
        body: { data },
      }),
      invalidatesTags: ["Template"],
    }),
    getBoqTemplateById: builder.query({
      query: ({ module_template }) => ({
        url: `/get-boq-template-by-id?moduleTemplateId=${module_template}`,
        method: "GET",
      }),
    }),
    createBoqProject: builder.mutation({
      query: ({ data }) => ({
        url: `create-boq-project`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Template"],
    }),

    getBoqCategoryByIdAndKey: builder.query({
      query: ({ _id, keyname }) =>
        `get-boq-catergories?_id=${_id}&keyname=${keyname}`,
      providesTags: ["Template"],
    }),

    getBoqProjectByProjectId: builder.query({
      query: (projectId) => `get-boq-project-by-project?projectId=${projectId}`,
      providesTags: ["Template"],
    }),
  }),
});

export const {
  useGetAllTemplatesQuery,
  useGetTemplatesByIdQuery,
  useAddTemplatesMutation,
  useUpdateTemplatesStatusOverallMutation,
  useUpdateTemplatesStatusItemsMutation,
  useDeleteTemplatesMutation,
  useUpdateTemplatesSheetMutation,
  useCreateBoqCategoryMutation,
  useCreateBoqTemplateRowMutation,
  useGetAllBoqCategoriesQuery,
  useGetAllBoqTemplatesQuery,
  useUpdateModuleTemplateIdMutation,
  useGetModuleCategoryByIdQuery,
  useUpdateModuleCategoryMutation,
  useUpdateModuleTemplateStatusMutation,
  useGetBoqProjectQuery,
  useUpdateBoqProjectMutation,
  useGetBoqTemplateByIdQuery,
  useCreateBoqProjectMutation,
  useLazyGetBoqCategoryByIdAndKeyQuery,
  useGetBoqProjectByProjectIdQuery,
} = templatesApi;
