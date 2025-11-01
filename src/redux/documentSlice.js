import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

function buildUploadFormData({ items = [], links = [] }) {
  const fd = new FormData();
  items.forEach(({ file, name }) => {
    fd.append("files", file);
    fd.append("names[]", name);
  });
  links.forEach((url) => {
    fd.append("documents[]", url);
  });
  return fd;
}

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/document`,
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
    getProjectDocuments: builder.query({
      query: (projectId) => ({
        url: `/documents?project_id=${projectId}`,
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

    uploadProjectDocuments: builder.mutation({
      query: ({ projectId, items, links = [] }) => {
        const body = buildUploadFormData({ items, links });
        return {
          url: `?project_id=${projectId}`,
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
      invalidatesTags: (_res, _err, arg) =>
        arg.projectId
          ? [{ type: "ProjectDocs", id: `PROJECT-${arg.projectId}` }]
          : [],
    }),

    getDocumentByName: builder.query({
      query: ({ projectId, name }) => ({
        url: `/document-by-name?project_id=${projectId}&name=${name}`,
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
  }),
});

export const {
  useGetProjectDocumentsQuery,
  useUploadProjectDocumentsMutation,
  useDeleteDocumentMutation,
  useGetDocumentByNameQuery,
} = documentApi;
