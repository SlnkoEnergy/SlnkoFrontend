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

export const camsApi = createApi({
  reducerPath: "camsApi",
  baseQuery,
  tagTypes: ["CAM"],
  endpoints: (builder) => ({
    getHandOver: builder.query({
      query: ({ page = 1, search = "", status, limit, createdAtFrom, createdAtTo }) =>
        `handover/get-all-handover-sheet?page=${page}&search=${search}&status=${status}&limit=${limit}&createdAtFrom=${createdAtFrom}&createdAtTo=${createdAtTo}`,
      transformResponse: (response) => ({
        data: response.data || [],
        total: response.meta?.total || 0,
      }),
      providesTags: ["CAM"],
    }),

    getHandOverById: builder.query({
      query: ({ leadId, p_id, id }) => {
        if (p_id) {
          return `handover/get-handoversheet?p_id=${p_id}`;
        } else if (leadId) {
          return `handover/get-handoversheet?leadId=${leadId}`;
        } else if (id) {
          return `handover/get-handoversheet?id=${id}`;
        } else {
          console.warn("getHandOver called with no valid identifier.");
          return { url: "", method: "GET" };
        }
      },
      providesTags: ["CAM"],
    }),

    addHandOver: builder.mutation({
      query: (newHandOver) => ({
        url: "handover/create-hand-over-sheet",
        method: "POST",
        body: newHandOver,
      }),
      invalidatesTags: ["CAM"],
    }),

    updateHandOver: builder.mutation({
      query: ({ _id, ...data }) => ({
        url: `handover/edit-hand-over-sheet/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CAM"],
    }),

    updateStatusHandOver: builder.mutation({
      query: ({ _id, ...data }) => ({
        url: `handover/update-status/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CAM"],
    }),

    updateUnlockHandoversheet: builder.mutation({
      query: ({ p_id, emp_id }) => ({
        url: "handover/update-status-of-handoversheet",
        method: "PUT",
        body: { p_id, emp_id },
      }),
    }),

    // Purchase Request
    getMaterialCategory: builder.query({
      query: ({ project_id }) =>
        `engineering/material-category-drop?project_id=${project_id}`,
    }),
    createPurchaseRequest: builder.mutation({
      query: (payload) => ({
        url: "purchaseRequest/purchase-request",
        method: "POST",
        body: { purchaseRequestData: payload },
      }),
      invalidatesTags: ["CAM"],
    }),
    getPurchaseRequestById: builder.query({
      query: (id) => `purchaseRequest/purchase-request/${id}`,
    }),
    getPurchaseRequestByProjectId: builder.query({
      query: (id) =>
        `purchaseRequest/purchase-request-project_id?project_id=${id}`,
    }),
    getAllPurchaseRequest: builder.query({
      query: ({
        page = 1,
        search = "",
        limit = 10,
        itemSearch = "",
        poValueSearch = "",
        statusSearch = "",
        createdFrom = "",
        createdTo = "",
        etdFrom = "",
        etdTo = "",
        open_pr = false,
      }) =>
        `purchaseRequest/purchase-request?page=${page}&search=${search}&itemSearch=${itemSearch}&poValueSearch=${poValueSearch}&statusSearch=${statusSearch}&createdFrom=${createdFrom}&createdTo=${createdTo}&etdFrom=${etdFrom}&etdTo=${etdTo}&open_pr=${open_pr}&limit=${limit}`,
      transformResponse: (response) =>
        response || { data: [], totalCount: 0, totalPages: 1 },
      providesTags: ["CAM"],
    }),

    getPurchaseRequest: builder.query({
      query: ({ project_id, item_id, pr_id }) =>
        `purchaseRequest/${project_id}/item/${item_id}/pr/${pr_id}`,
    }),
    editPurchaseRequest: builder.mutation({
      query: ({ pr_id, payload }) => ({
        url: `purchaseRequest/purchase-request/${pr_id}`,
        method: "PUT",
        body: payload,
      }),
    }),
    fetchFromBOM: builder.query({
      query: (params) => ({
        url: "purchaseRequest/fetch-boq",
        params,
      }),
    }),

    // Scope
    getScopeByProjectId: builder.query({
      query: ({ project_id }) => `scope/scope?project_id=${project_id}`,
    }),
    updateScopeByProjectId: builder.mutation({
      query: ({ project_id, payload }) => ({
        url: `scope/scope?project_id=${project_id}`,
        method: "PUT",
        body: payload,
      }),
    }),
    updateScopeStatus: builder.mutation({
      query: ({ project_id, status, remarks }) => ({
        url: `scope/${project_id}/updateStatus`,
        method: "PUT",
        body: { status, remarks },
      }),
    }),
    generateScopePdf: builder.mutation({
      query: ({ project_id }) => ({
        url: `scope/scope-pdf?project_id=${project_id}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
    updateHandoverAssignee: builder.mutation({
      query: ({ selected, assignee }) => ({
        url: `handover/updateAssignedto`,
        method: "PUT",
        body: { handoverIds: selected, AssignedTo: assignee },
      }),
    }),
  }),
});

export const {
  useGetHandOverQuery,
  useGetHandOverByIdQuery,
  useAddHandOverMutation,
  useUpdateHandOverMutation,
  useUpdateHandoverAssigneeMutation,
  useUpdateUnlockHandoversheetMutation,
  useUpdateStatusHandOverMutation,
  useGetMaterialCategoryQuery,
  useCreatePurchaseRequestMutation,
  useGetAllPurchaseRequestQuery,
  useGetPurchaseRequestByIdQuery,
  useGetPurchaseRequestByProjectIdQuery,
  useGetPurchaseRequestQuery,
  useEditPurchaseRequestMutation,
  useLazyFetchFromBOMQuery,
  useGetScopeByProjectIdQuery,
  useUpdateScopeByProjectIdMutation,
  useUpdateScopeStatusMutation,
  useGenerateScopePdfMutation,
} = camsApi;
