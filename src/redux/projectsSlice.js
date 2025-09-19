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
      providesTags: ["Project"],
    }),
    getProjectSearchDropdown: builder.query({
      query: ({ search, page, limit }) =>
        `project-search?search=${search}&page=${page}&limit=${limit}`,
      providesTags: ["Project"],
    }),

    //Activiy
    createActivity: builder.mutation({
      query: (newActivity) => ({
        url: "activities/activity",
        method: "POST",
        body: newActivity,
      }),
      invalidatesTags: ["Project"],
    }),
    getAllActivity: builder.query({
      query: () => `activities/activities`,
      providesTags: ["Project"],
    }),

    //Project Activity
    createProjectActivity: builder.mutation({
      query: (newProjectActivity) => ({
        url: "projectactivity/projectactivity",
        method: "POST",
        body: newProjectActivity,
      }),
      invalidatesTags: ["Project"],
    }),

getAllProjectActivities: builder.query({
  // GET /v1/projectactivity/activities?search=&status=&page=1&limit=10
  query: ({ search = "", status = "", page = 1, limit = 10 } = {}) => ({
    url: "activities/activities",
    params: { search, ...(status ? { status } : {}), page, limit },
  }),
  providesTags: ["Project"],
}),

    getProjectActivityByProjectId: builder.query({
      query: (projectId) =>
        `projectactivity/projectactivity?projectId=${projectId}`,
      providesTags: ["Project"],
    }),
    updateProjectActivity: builder.mutation({
      query: (newActivity, id) => `projectactivity/projectactivity/${id}`,
      providesTags: ["Project"],
    }),

    pushActivityToProject: builder.mutation({
      query: ({ projectId, name, description, type }) => ({
        url: `projectactivity/pushactivity/${encodeURIComponent(projectId)}`,
        method: "PUT",
        body: { name, description, type },
      }),
      invalidatesTags: ["Project"],
    }),
    updateActivityInProject: builder.mutation({
      query: ({ projectId, activityId, data }) => ({
        url: `projectactivity/${projectId}/activity/${activityId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Project"],
    }),
    getActivityInProject: builder.query({
      query: ({ projectId, activityId }) =>
        `projectactivity/${projectId}/activity/${activityId}`,
      providesTags: ["Project"],
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
  useLazyGetProjectSearchDropdownQuery,
  //Activity
  useCreateActivityMutation,
  useGetAllActivityQuery,

  //Project Activity
  useCreateProjectActivityMutation,
  useGetAllProjectActivityQuery,
  useUpdateProjectActivityMutation,
  usePushActivityToProjectMutation,
  useGetProjectActivityByProjectIdQuery,
  useUpdateActivityInProjectMutation,
  useGetActivityInProjectQuery,
  useGetAllProjectActivitiesQuery,
  useLazyGetAllProjectActivitiesQuery,
} = projectsApi;
