import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL}/`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");

      if (token) {
        headers.set("x-auth-token", token);
      }

      return headers;
    },
  }),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => "get-all-projecT-IT",
      providesTags: ["Project"],
    }),
    deleteProject: builder.mutation({
      query: (_id) => ({
        url: `delete-by-id-IT/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),
    addProject: builder.mutation({
      query: (newProject) => ({
        url: "add-new-project-IT",
        method: "POST",
        body: newProject,
      }),
      invalidatesTags: ["Project"],
    }),
    updateProject: builder.mutation({
      query: ({ _id, updatedData }) => ({
        url: `update-projecT-IT/${_id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Project"],
    }),
    getProjectByPId: builder.query({
      query: (p_id) => `project?p_id=${p_id}`,
      providesTags: ["Project"],
    }),
    getProjectById: builder.query({
      query: (id) => `get-project-iD-IT/${id}`,
      providesTags: ["Project"],
    }),
     getProjectDropdown: builder.query({
      query: () => "project-dropdown",
    }),
    getProjectSearchDropdown: builder.query({
      query: ({search, page, limit}) => `project-search?search=${search}&page=${page}&limit=${limit}`
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useDeleteProjectMutation,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useGetProjectByPIdQuery,
  useGetProjectByIdQuery,
  useGetProjectDropdownQuery,
  useGetProjectSearchDropdownQuery,
  useLazyGetProjectSearchDropdownQuery
} = projectsApi;
