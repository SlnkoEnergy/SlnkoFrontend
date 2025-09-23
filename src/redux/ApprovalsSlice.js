import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    if (token) headers.set("x-auth-token", token);
    return headers;
  },
});

export const approvalsApi = createApi({
  reducerPath: "approvalsApi",
  baseQuery,
  tagTypes: ["Approval", "ApprovalModels", "ApprovalRequests", "ApprovalReviews"],
  endpoints: (builder) => ({
    getUniqueModel: builder.query({
      query: () => "approvals/uniquemodels",
      providesTags: (result) => [
        "Approval",
        { type: "ApprovalModels", id: "LIST" },
      ],
    }),

    getRequests: builder.query({
      query: ({ page, limit, search }) =>
        `approvals/requests?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search ?? ""
        )}`,
      providesTags: (result, error, args) => [
        "Approval",
        { type: "ApprovalRequests", id: "LIST" },
        { type: "ApprovalRequests", id: `${args.page}|${args.limit}|${args.search ?? ""}` },
      ],
    }),

    getReviews: builder.query({
      query: ({ page, limit, search }) =>
        `approvals/reviews?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search ?? ""
        )}`,
      providesTags: (result, error, args) => [
        "Approval",
        { type: "ApprovalReviews", id: "LIST" },
        { type: "ApprovalReviews", id: `${args.page}|${args.limit}|${args.search ?? ""}` },
      ],
    }),

    updateRequestStatus: builder.mutation({
      query: ({ approvalId, status, remarks }) => ({
        url: `approvals/${approvalId}/updateStatus`,
        method: "PUT",
        body: { status, remarks },
      }),
      invalidatesTags: [
        "Approval",
        { type: "ApprovalModels", id: "LIST" },
        { type: "ApprovalRequests", id: "LIST" },
        { type: "ApprovalReviews", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUniqueModelQuery,
  useGetRequestsQuery,
  useGetReviewsQuery,
  useUpdateRequestStatusMutation,
} = approvalsApi;
