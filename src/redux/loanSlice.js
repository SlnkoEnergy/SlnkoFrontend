// src/redux/loanApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

function buildCreateLoanFormData({ data = {}, files = [], links = [] }) {
  const fd = new FormData();

  fd.append("data", JSON.stringify(data));

  let idx = 0;

  files.forEach(({ file, name }) => {
    if (!file) return;
    fd.append("files", file);
    fd.append(
      `file_filename[${idx}][name]`,
      name ?? (file?.name || "document")
    );
    fd.append(`file_filename[${idx}][fileIndex]`, String(idx));
    idx += 1;
  });

  links.forEach(({ url, name }) => {
    if (!url) return;
    fd.append(`file_filename[${idx}][name]`, name || "document");
    fd.append(`file_filename[${idx}][url]`, url);
    idx += 1;
  });

  return fd;
}

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/loan`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    if (token) headers.set("x-auth-token", token);
    return headers;
  },
});

export const loanApi = createApi({
  reducerPath: "loanApi",
  baseQuery,
  tagTypes: ["Loan", "UniqueBanks"],
  endpoints: (builder) => ({
    getUniqueBanks: builder.query({
      query: ({ search = "" } = {}) => ({
        url: `/unique-bank${
          search ? `?search=${encodeURIComponent(search)}` : ""
        }`,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map((_, i) => ({ type: "UniqueBanks", id: i })),
              { type: "UniqueBanks", id: "LIST" },
            ]
          : [{ type: "UniqueBanks", id: "LIST" }],
    }),

    createLoan: builder.mutation({
      query: ({ projectId, data, files = [], links = [] }) => {
        const formData = buildCreateLoanFormData({ data, files, links });
        return {
          url: `/?project_id=${encodeURIComponent(projectId)}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [
        { type: "Loan", id: "LIST" },
        { type: "UniqueBanks", id: "LIST" },
      ],
    }),

    getAllLoan: builder.query({
      query: ({ search, limit, page } = {}) => ({
        url: `?page=${page}&limit=${limit}&search=${search}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map((_, i) => ({ type: "UniqueBanks", id: i })),
              { type: "UniqueBanks", id: "LIST" },
            ]
          : [{ type: "UniqueBanks", id: "LIST" }],
    }),

    getLoanById: builder.query({
        query: (project_id) => ({
        url: `/loan?project_id=${project_id}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map((_, i) => ({ type: "UniqueBanks", id: i })),
              { type: "Loan", id: "LIST" },
            ]
          : [{ type: "Loan", id: "LIST" }],
    }),

    updateLoanStatus: builder.mutation({
        query: ({project_id, status, remarks}) => ({
        url: `/${project_id}/status`,
        method: "PATCH",
        body:{status, remarks}
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map((_, i) => ({ type: "UniqueBanks", id: i })),
              { type: "Loan", id: "LIST" },
            ]
          : [{ type: "Loan", id: "LIST" }],
    }),

     addComment: builder.mutation({
        query: ({project_id, remarks}) => ({
        url: `/comment?project_id=${project_id}`,
        method: "PATCH",
        body:{remarks}
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map((_, i) => ({ type: "UniqueBanks", id: i })),
              { type: "Loan", id: "LIST" },
            ]
          : [{ type: "Loan", id: "LIST" }],
    }),

     uploadExistingDocument: builder.mutation({
      query: ({ project_id, document_id, file, file_url }) => {
        const url = `/upload-existing-document?project_id=${project_id}&document_id=${document_id}`;
        if (file) {
          const form = new FormData();
          form.append("file", file);
          return {
            url,
            method: "PATCH",
            body: form,
          };
        }
        return {
          url,
          method: "PATCH",
          body: { file_url: file_url || "" },
        };
      },
      invalidatesTags: [{ type: "Loan", id: "LIST" }],
    }),

     addLoanDocument: builder.mutation({
      query: ({ project_id, filename, file }) => {
        const form = new FormData();
        if (filename) form.append("filename", filename);
        if (file) form.append("file", file);
        return {
          url: `/document?project_id=${encodeURIComponent(project_id)}`,
          method: "PATCH",
          body: form,
        };
      },
      invalidatesTags: (_r, _e, { project_id }) => [{ type: "Loan", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUniqueBanksQuery,
  useCreateLoanMutation,
  useGetAllLoanQuery,
  useGetLoanByIdQuery,
  useUpdateLoanStatusMutation,
  useAddCommentMutation,
  useUploadExistingDocumentMutation,
  useAddLoanDocumentMutation
} = loanApi;
