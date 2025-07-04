import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IdCardIcon } from "lucide-react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/`,
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
      query: ({ page = 1, search = "", status }) =>
        `get-all-handover-sheet?page=${page}&search=${search}&status=${status}`,
      transformResponse: (response) => ({
        data: response.data || [],
        total: response.meta?.total || 0,
      }),
      providesTags: ["CAM"],
    }),

    getHandOverById: builder.query({
      query: ({ leadId, p_id, id }) => {
        if (p_id) {
          return `get-handoversheet?p_id=${p_id}`;
        } else if (leadId) {
          return `get-handoversheet?leadId=${leadId}`;
        } else if (id) {
          return `get-handoversheet?id=${id}`;
        } else {
          console.warn("getHandOver called with no valid identifier.");
          return { url: "", method: "GET" };
        }
      },
      providesTags: ["CAM"],
    }),

    addHandOver: builder.mutation({
      query: (newHandOver) => ({
        url: "create-hand-over-sheet",
        method: "POST",
        body: newHandOver,
      }),
      invalidatesTags: ["CAM"],
    }),

    updateHandOver: builder.mutation({
      query: ({ _id, ...data }) => ({
        url: `edit-hand-over-sheet/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CAM"],
    }),

    updateStatusHandOver: builder.mutation({
      query: ({ _id, ...data }) => ({
        url: `update-status/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CAM"],
    }),

    updateUnlockHandoversheet: builder.mutation({
      query: ({ p_id, emp_id }) => ({
        url: "update-status-of-handoversheet",
        method: "PUT",
        body: { p_id, emp_id },
      }),
    }),

    // Purchase Request
    getProjectDropdown: builder.query({
      query: () => "project-dropdown",
    }),
    getMaterialCategory: builder.query({
      query: () => "engineering/material-category-drop",
    }),
    createPurchaseRequest: builder.mutation({
      query: (payload) => ({
        url: "purchaseRequest/purchase-request",
        method: "POST",
        body: { purchaseRequestData: payload },
      }),
      invalidatesTags: ["CAM"],
    }),
    getAllPurchaseRequesr: builder.query({
      query: () => "purchaseRequest/purchase-request",
    }),
  }),
});

export const {
  useGetHandOverQuery,
  useGetHandOverByIdQuery,
  useAddHandOverMutation,
  useUpdateHandOverMutation,
  useUpdateUnlockHandoversheetMutation,
  useUpdateStatusHandOverMutation,
  useGetProjectDropdownQuery,
  useGetMaterialCategoryQuery,
  useCreatePurchaseRequestMutation,
  useGetAllPurchaseRequesrQuery,
} = camsApi;
