import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.slnkoprotrac.com/v1/" }),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => "get-all-project-IT",
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
        url: "/add-new-project-IT",
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
  }),
});

export const { 
  useGetProjectsQuery, 
  useDeleteProjectMutation,
  useAddProjectMutation,
  useUpdateProjectMutation 
} = projectsApi;

