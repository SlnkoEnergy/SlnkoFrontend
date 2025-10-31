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
      query: ({
        page = 1,
        search = "",
        status,
        limit,
        createdAtFrom,
        createdAtTo,
      }) =>
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
    getAllScopes: builder.query({
      query: (params = {}) => {
        const {
          page = 1,
          limit = 20,
          search = "",
          project_id = "",
          state = "",
          cam_person = "",
          po_status = "",
          etd_from = "",
          etd_to = "",
          delivered_from = "",
          delivered_to = "",
          item_name = "",
          scope = "",
          po_date_from = "",
          po_date_to = "",
          project_status = "",
          current_commitment_date_from = "",
          current_commitment_date_to = "",
        } = params;

        // Helper to build query string dynamically
        const queryParams = new URLSearchParams();

        if (page) queryParams.append("page", page);
        if (limit) queryParams.append("limit", limit);
        if (search) queryParams.append("search", search);
        if (project_id) queryParams.append("project_id", project_id);
        if (state) queryParams.append("state", state);
        if (cam_person) queryParams.append("cam_person", cam_person);
        if (po_status) queryParams.append("po_status", po_status);
        if (etd_from) queryParams.append("etd_from", etd_from);
        if (etd_to) queryParams.append("etd_to", etd_to);
        if (delivered_from)
          queryParams.append("delivered_from", delivered_from);
        if (delivered_to) queryParams.append("delivered_to", delivered_to);
        if (item_name) queryParams.append("item_name", item_name);
        if (scope) queryParams.append("scope", scope);
        if (po_date_from) queryParams.append("po_date_from", po_date_from);
        if (po_date_to) queryParams.append("po_date_to", po_date_to);
        if (project_status)
          queryParams.append("project_status", project_status);
        if (current_commitment_date_from)
          queryParams.append(
            "current_commitment_date_from",
            current_commitment_date_from
          );
        if (current_commitment_date_to)
          queryParams.append(
            "current_commitment_date_from",
            current_commitment_date_to
          );
        return `scope/scopes?${queryParams.toString()}`;
      },

      transformResponse: (response) => ({
        data: response?.data || [],
        total: response?.total || 0,
        page: response?.page || 1,
        totalPages: response?.totalPages || 1,
        count: response?.count || 0,
      }),

      providesTags: ["Scope"],

      // Auto refetch when arguments differ
      forceRefetch({ currentArg, previousArg }) {
        return JSON.stringify(currentArg) !== JSON.stringify(previousArg);
      },
    }),
    exportScopes: builder.mutation({
      query: ({
        selected,
        type,
        project_id,
        state,
        cam_person,
        po_status,
        item_name,
        scope,
        etd_from,
        etd_to,
        delivered_from,
        delivered_to,
        po_date_from,
        po_date_to,
        project_status,
        current_commitment_date_from,
        current_commitment_date_to,
      }) => ({
        url: `scope/export-scopes?type=${type}&project_id=${project_id}&state=${state}&cam_person=${cam_person}&po_status=${po_status}&item_name=${item_name}&scope=${scope}&etd_from=${etd_from}&etd_to=${etd_to}&delivered_from=${delivered_from}&delivered_to=${delivered_to}&po_date_from=${po_date_from}&po_date_to=${po_date_to}&project_status=${project_status}&current_commitment_date_from=${current_commitment_date_from}&current_commitment_date_to=${current_commitment_date_to}`,
        method: "POST",
        body: { selected },
        responseHandler: (response) => response.blob(),
      }),
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
      query: ({ project_id, view, format, columns}) => ({
        url: `scope/scope-pdf?project_id=${project_id}&view=${view}&format=${format}`,
        method: "POST",
        body: {columns},
        responseHandler: (response) => response.blob(),
      }),
    }),
    updateCommitmentDate: builder.mutation({
      query: ({ id, item_id, date, remarks }) => ({
        url: `scope/${id}/scope/${item_id}/commitment`,
        method: "PUT",
        body: { date, remarks },
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
  useGetAllScopesQuery,
  useUpdateScopeByProjectIdMutation,
  useUpdateScopeStatusMutation,
  useUpdateCommitmentDateMutation,
  useGenerateScopePdfMutation,
  useExportScopesMutation,
} = camsApi;
