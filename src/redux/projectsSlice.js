import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://dev.api.slnkoprotrac.com/v1/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    console.log("Token:", token);
    if (token) {
      headers.set("x-auth-token", token); // ✅ Match backend expectation
    }
    return headers;
  },
});
export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery,
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

