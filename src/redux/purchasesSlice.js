import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    // console.log("Token:", token);
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});
export const purchasesApi = createApi({
  reducerPath: "purchasesApi",
  baseQuery,
  tagTypes: ["Purchase"],
  endpoints: (builder) => ({
    getPurchases: builder.query({
      query: () => "get-all-pO-IT",
      providesTags: ["Purchase"],
    }),
    getPaginatedPOs: builder.query({
      query: ({
        page = 1,
        search = "",
        status,
        pageSize = 10,
        type,
        project_id,
        pr_id,
        item_id,
        etdFrom,
        etdTo,
        deliveryFrom,
        deliveryTo,
        filter,
        itemSearch,
      }) =>
        `get-paginated-po?page=${page}&search=${search}&status=${status}&pageSize=${pageSize}&type=${type}&project_id=${project_id}&pr_id=${pr_id}&item_id=${item_id}&etdFrom=${etdFrom}&etdTo=${etdTo}&deliveryFrom=${deliveryFrom}&deliveryTo=${deliveryTo}&filter=${filter}&itemSearch=${itemSearch}`,
      transformResponse: (response) => ({
        data: response.data || [],
        total: response.meta?.total || 0,
        count: response.meta?.count || 0,
      }),
      providesTags: ["Purchase"],
    }),

    getItems: builder.query({
      query: () => "get-iteM-IT",
      providesTags: ["Purchase"],
    }),

    exportPos: builder.mutation({
      query: ({ from, to, exportAll }) => {
        const params = new URLSearchParams();

        if (exportAll) {
          params.set("export", "all");
        } else {
          params.set("from", from);
          params.set("to", to);
        }

        return {
          url: `get-export-po?${params}`,
          method: "GET",
          responseHandler: (response) => response.blob(),
        };
      },
    }),

    addPurchases: builder.mutation({
      query: (newPurchase) => ({
        url: "/Add-purchase-ordeR-IT",
        method: "POST",
        body: newPurchase,
      }),
      invalidatesTags: ["Purchase"],
    }),
    updatePurchases: builder.mutation({
      query: ({ _id, updatedData }) => ({
        url: `edit-pO-IT/${_id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Purchase"],
    }),

    updateEtdOrDeliveryDate: builder.mutation({
      query: ({ po_number, etd, delivery_date }) => ({
        url: `/${encodeURIComponent(po_number)}/updateEtdOrDelivery`,
        method: "PUT",
        body: { etd, delivery_date },
      }),
      invalidatesTags: ["Purchase"],
    }),

    updatePurchasesStatus: builder.mutation({
      query: ({ id, status, remarks }) => ({
        url: `/updateStatusPO`,
        method: "PUT",
        body: {
          id,
          status,
          remarks,
        },
      }),
      invalidatesTags: ["Purchase"],
    }),
    getLogistics: builder.query({
      query: ({
        page = 1,
        pageSize = 50,
        search = "",
        status = "",
        po_id = "",
        po_number = "",
      } = {}) =>
        `logistics/logistic?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
          search
        )}&status=${encodeURIComponent(status)}&po_id=${encodeURIComponent(
          po_id
        )}&po_number=${encodeURIComponent(po_number)}`,
      transformResponse: (response) => ({
        data: response?.data || [],
        total: response?.meta?.total || 0,
        count:
          response?.meta?.count || (response?.data ? response.data.length : 0),
        page: response?.meta?.page || 1,
        pageSize: response?.meta?.pageSize || 50,
      }),
      providesTags: ["Logistic"],
    }),

    getLogisticById: builder.query({
      query: (id) => `logistics/logistic/${id}`,
      providesTags: ["Logistic"],
    }),

    addLogistic: builder.mutation({
      query: (newLogistic) => ({
        url: "logistics/logistic",
        method: "POST",
        body: newLogistic,
      }),
      invalidatesTags: ["Logistic"],
    }),

    // purchasesSlice.js (or wherever your API slice is)
    updateLogistic: builder.mutation({
      query: ({ id, body }) => ({
        url: `logistics/logistic/${id}`,
        method: "PUT",
        body, // <- now uses 'body'
      }),
      invalidatesTags: ["Logistic"],
    }),

    deleteLogistic: builder.mutation({
      query: (id) => ({
        url: `logistic/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Logistic"],
    }),

    getPoBasic: builder.query({
      query: ({ page = 1, pageSize = 10, search = "" }) =>
        `get-po-basic?page=${page}&pageSize=${pageSize}&search=${search}`,
      transformResponse: (response) => ({
        data: response.data || [],
        total:
          response.total ??
          response.pagination?.total ??
          response.meta?.total ??
          0,
        count:
          response.count ??
          response.pagination?.count ??
          response.meta?.count ??
          (response.data ? response.data.length : 0),
        pagination: response.pagination || null,
      }),
      providesTags: ["Purchase"],
    }),

    updateLogisticStatus: builder.mutation({
      query: ({ id, status, remarks }) => ({
        url: `logistics/logistic/${id}/status`,
        method: "PUT",
        body: { status, remarks },
      }),
      invalidatesTags: ["Logistic"],
    }),

    // Logistics History
    getLogisticsHistory: builder.query({
      query: ({ subject_type, subject_id }) => {
        const params = new URLSearchParams({
          subject_type,
          subject_id,
        });

        return `/logistics/logistichistory?${params.toString()}`;
      },
      providesTags: ["Logistic"],
    }),

    addLogisticHistory: builder.mutation({
      query: (newHistory) => ({
        url: "/logistics/logistichistory",
        method: "POST",
        body: newHistory,
      }),
      invalidatesTags: ["Logistic"],
    }),
  }),
});

export const {
  useGetPurchasesQuery,
  useGetItemsQuery,
  useGetPaginatedPOsQuery,
  useExportPosMutation,
  useAddPurchasesMutation,
  useUpdatePurchasesMutation,
  useUpdateEtdOrDeliveryDateMutation,
  useUpdatePurchasesStatusMutation,
  useGetLogisticsQuery,
  useGetLogisticByIdQuery,
  useAddLogisticMutation,
  useUpdateLogisticMutation,
  useDeleteLogisticMutation,
  useGetPoBasicQuery,
  useLazyGetPoBasicQuery,
  useUpdateLogisticStatusMutation,
  useLazyGetLogisticsHistoryQuery,
  useAddLogisticHistoryMutation
} = purchasesApi;
