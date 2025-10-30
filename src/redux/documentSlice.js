// src/redux/documentApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/** Build FormData from:
 *  items: [{ file: File, name: string }]
 *  links: string[]  (optional direct URLs to save as entries)
 */
function buildUploadFormData({ items = [], links = [] }) {
  const fd = new FormData();
  items.forEach(({ file, name }) => {
    fd.append("files", file);        // <-- multer field name
    fd.append("names[]", name);      // <-- server reads names[] (required)
  });
  links.forEach((url) => {
    fd.append("documents[]", url);   // <-- optional URL rows
  });
  return fd;
}

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/documents`,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    if (token) headers.set("x-auth-token", token);
    return headers;
  },
});

export const documentApi = createApi({
  reducerPath: "documentApi",
  baseQuery,
  tagTypes: ["ProjectDocs"],
  endpoints: (builder) => ({
    /** List docs for a project */
    getProjectDocuments: builder.query({
      query: (projectId) => ({
        url: `/projects/${projectId}/documents`,
        method: "GET",
      }),
      providesTags: (result, _err, projectId) =>
        result?.data?.length
          ? [
              ...result.data.map((d) => ({ type: "ProjectDocs", id: d._id })),
              { type: "ProjectDocs", id: `PROJECT-${projectId}` },
            ]
          : [{ type: "ProjectDocs", id: `PROJECT-${projectId}` }],
    }),

    /** Upload multiple files (and/or URL links) for a project */
    uploadProjectDocuments: builder.mutation({
      /**
       * arg = {
       *   projectId: string,
       *   items: [{ file: File, name: string }],
       *   links?: string[]
       * }
       */
      query: ({ projectId, items, links = [] }) => {
        const body = buildUploadFormData({ items, links });
        return {
          url: `/projects/${projectId}/documents`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: (_res, _err, arg) => [
        { type: "ProjectDocs", id: `PROJECT-${arg.projectId}` },
      ],
    }),

    /** Delete a single document by id */
    deleteDocument: builder.mutation({
      query: ({ docId }) => ({
        url: `/${docId}`,
        method: "DELETE",
      }),
      // If your API also needs projectId to refetch list, pass it in arg
      invalidatesTags: (_res, _err, arg) =>
        arg.projectId
          ? [{ type: "ProjectDocs", id: `PROJECT-${arg.projectId}` }]
          : [],
    }),
  }),
});

export const {
  useGetProjectDocumentsQuery,
  useUploadProjectDocumentsMutation,
  useDeleteDocumentMutation,
} = documentApi;
