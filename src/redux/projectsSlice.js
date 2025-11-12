import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const makeQuery = (obj = {}) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (!trimmed) return;
      params.set(k, trimmed);
      return;
    }
    if (Array.isArray(v)) {
      if (v.length === 0) return;
      params.set(k, v.join(","));
      return;
    }
    params.set(k, String(v));
  });
  const q = params.toString();
  return q ? `?${q}` : "";
};

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

    getAllProjects: builder.query({
      query: ({ page, limit, search, status, sort }) =>
        `projects?page=${page}&limit=${limit}&search=${search}&status=${status}&sort=${sort}`,
      providesTags: ["Project"],
    }),

    getAllProjectsForLoan: builder.query({
      query: (args = {}) => {
        const {
          page,
          limit,
          search,
          status,
          sort,

          loan_status,
          bank_state,

          expected_disbursement_from,
          expected_disbursement_to,

          expected_sanction_from,
          expected_sanction_to,

          actual_disbursement_from,
          actual_disbursement_to,

          actual_sanction_from,
          actual_sanction_to,
        } = args;

        const qs = makeQuery({
          page,
          limit,
          search,
          status,
          sort,

          loan_status,
          bank_state,

          expected_disbursement_from,
          expected_disbursement_to,

          expected_sanction_from,
          expected_sanction_to,

          actual_disbursement_from,
          actual_disbursement_to,

          actual_sanction_from,
          actual_sanction_to,
        });

        return `project-loan${qs}`;
      },
      providesTags: ["Project"],
    }),
    exportLoan: builder.mutation({
      query: ({
        project_ids,
        type,
        loan_status,
        bank_state,

        expected_disbursement_from,
        expected_disbursement_to,

        expected_sanction_from,
        expected_sanction_to,

        actual_disbursement_from,
        actual_disbursement_to,

        actual_sanction_from,
        actual_sanction_to,
      }) => ({
        url: `/export-loan?type=${type}&loan_status=${loan_status}&bank_state=${bank_state}&expected_disbursement_from=${expected_disbursement_from}&expected_disbursement_to=${expected_disbursement_to}&expected_sanction_from=${expected_sanction_from}&expected_sanction_to=${expected_sanction_to}&actual_disbursement_from=${actual_disbursement_from}&actual_sanction_from=${actual_sanction_from}&actual_sanction_to=${actual_sanction_to}&actual_disbursement_to=${actual_disbursement_to}`,
        method: "POST",
        body: { project_ids },
        responseHandler: (response) => response.blob(),
      }),
    }),
    updateProjectStatus: builder.mutation({
      query: ({ projectId, status, remarks }) => ({
        url: `${projectId}/updateProjectStatus`,
        method: "PUT",
        body: { status, remarks },
      }),
      invalidatesTags: ["Project"],
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
    getProjectStatusFilter: builder.query({
      query: () => `/project-status-filter`,
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
      query: ({ search = "", status = "", page = 1, limit = 10 } = {}) => ({
        url: "projectactivity/allprojectactivity",
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
      query: ({ projectId, name, description, type, dependencies = [] }) => ({
        url: `projectactivity/pushactivity/${encodeURIComponent(projectId)}`,
        method: "PUT",
        body: { name, description, type, dependencies },
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

    getAllTemplateNameSearch: builder.query({
      query: ({ search, page, limit }) =>
        `projectactivity/namesearchtemplate?search=${search}&page=${page}&limit=${limit}`,
      providesTags: ["Project"],
    }),

    updateProjectActivityFromTemplate: builder.mutation({
      query: ({ projectId, activityId }) => ({
        url: `projectactivity/${projectId}/projectactivity/${activityId}/fromtemplate`,
        method: "PUT",
      }),
      invalidatesTags: ["Project"],
    }),

    getActivitiesByName: builder.query({
      query: ({ search = "", page = 1, limit = 10 } = {}) => ({
        url: "activities/activities",
        params: { search, page, limit },
      }),
      transformResponse: (res) => ({
        items: Array.isArray(res?.data) ? res.data : [],
        pagination: res?.pagination ?? {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 1,
          hasMore: false,
          nextPage: null,
        },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((a) => ({ type: "Activity", id: a._id })),
              { type: "Activity", id: "LIST" },
            ]
          : [{ type: "Activity", id: "LIST" }],
    }),

    getAllModules: builder.query({
      query: ({ search = "", page = 1, limit = 10 } = {}) => ({
        url: "engineering/get-module-paginated",
        method: "GET",
        params: { search, page, limit },
      }),

      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        pagination: res?.pagination ?? {
          page: 1,
          limit: 10,
          totalDocs: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          nextPage: null,
          prevPage: null,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((m) => ({ type: "Module", id: m._id })),
              { type: "Module", id: "LIST" },
            ]
          : [{ type: "Module", id: "LIST" }],
    }),

    nameSearchActivityByProjectId: builder.query({
      query: ({ projectId, page = 1, limit = 7, search = "" }) => ({
        url: "projectactivity/namesearchactivitybyprojectid",
        params: {
          projectId,
          page,
          limit,
          search,
        },
      }),
      transformResponse: (res) => ({
        ok: !!res?.ok,
        page: res?.page ?? 1,
        limit: res?.limit ?? 7,
        total: res?.total ?? 0,
        totalPages: res?.totalPages ?? 1,
        activities: Array.isArray(res?.activities) ? res.activities : [],
      }),
      providesTags: ["Project"],
    }),

    namesearchMaterialCategories: builder.query({
      query: ({ search = "", page = 1, limit = 7 } = {}) => ({
        url: "products/category",
        params: { search, page, limit },
      }),
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        pagination: res?.pagination ?? {
          search: "",
          page: 1,
          pageSize: 7,
          total: 0,
          totalPages: 1,
          hasMore: false,
          nextPage: null,
        },
        meta: res?.meta ?? {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((m) => ({
                type: "MaterialCategory",
                id: m._id,
              })),
              { type: "MaterialCategory", id: "LIST" },
            ]
          : [{ type: "MaterialCategory", id: "LIST" }],
    }),

    updateDependency: builder.mutation({
      query: ({ id, global = true, projectId, body }) => ({
        url: `activities/${id}/updatedependency`,
        method: "PUT",
        params: {
          global: String(Boolean(global)),
          ...(global ? {} : { projectId }),
        },
        body,
      }),

      invalidatesTags: ["Project"],
    }),

    createApproval: builder.mutation({
      query: (payload) => ({
        url: "approvals/approval",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Approval"],
    }),

    getRejectedOrNotAllowedDependencies: builder.query({
      query: ({ projectId, activityId }) => ({
        url: `projectactivity/${encodeURIComponent(
          projectId
        )}/dependencies/${encodeURIComponent(activityId)}`,
        method: "GET",
      }),
      providesTags: (result, error, args) => {
        const key =
          args && args.projectId && args.activityId
            ? `${args.projectId}:${args.activityId}`
            : "UNKNOWN";
        return [{ type: "ProjectActivityDependencies", id: key }];
      },
    }),
    reorderProjectActivities: builder.mutation({
      query: ({ projectId, ordered_activity_ids }) => ({
        url: `projectactivity/reorder/${projectId}`,
        method: "PATCH",
        body: { ordered_activity_ids },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectActivities", id: projectId },
      ],
    }),

    getProjectStatesFilter: builder.query({
      query: () => `project-state-detail`,
      providesTags: ["Project"],
    }),

    getProjectDetail: builder.query({
      query: ({ q }) => {
        const qs = q ? `?q=${encodeURIComponent(q)}` : "";
        return `project-detail${qs}`;
      },
      providesTags: ["Project"],
    }),

    getActivityLineByProjectId: builder.query({
      query: (projectId) => {
        return {
          url: `/project-activity-chart/${encodeURIComponent(projectId)}`,
          method: "GET",
        };
      },
      providesTags: (_res, _err, projectId) => [
        { type: "Project", id: projectId ?? "default" },
      ],
    }),

    getProjectDropdownForDashboard: builder.query({
      query: () => `/project-dropdown-detail`,
    }),

    getPostsActivityFeed: builder.query({
      query: () => `allposts`,
      providesTags: ["Project"],
    }),

    getProjectActivityForView: builder.query({
      query: ({ baselineStart, baselineEnd, filter }) =>
        `projectactivity/allprojectactivityforview?baselineStart=${baselineStart}&baselineEnd=${baselineEnd}&filter=${filter}`,
      providesTags: ["Project"],
    }),

    getResources: builder.query({
      query: (args = {}) => {
        const { window: windowKeyIn, start, end, project_id } = args || {};
        let windowKey = windowKeyIn;
        if (!windowKey) {
          if (start && end) {
            const toDate = (s) => {
              const [y, m, d] = String(s).split("-").map(Number);
              const dt = new Date(y, (m || 1) - 1, d || 1);
              dt.setHours(0, 0, 0, 0);
              return dt;
            };
            const s = toDate(start);
            const e = toDate(end);
            const days = Math.max(1, Math.round((e - s) / 86400000) + 1);

            if (days <= 7) windowKey = "1w";
            else if (days <= 14) windowKey = "2w";
            else if (days <= 21) windowKey = "3w";
            else if (days <= 30) windowKey = "1m";
            else if (days <= 90) windowKey = "3m";
            else windowKey = "6m";
          } else {
            windowKey = "1w";
          }
        }

        const params = { window: windowKey };
        // if (project_id) params.project_id = project_id;

        return {
          url: "projectactivity/resources",
          params,
        };
      },
    }),
    updateStatusOfPlan: builder.mutation({
      query: ({ projectId, status }) => ({
        url: `projectactivity/${projectId}/updateStatusOfPlan`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Project"],
    }),
    exportProjectSchedule: builder.mutation({
      query: ({ projectId, type, timeline }) => {
        return {
          url: `/projectactivity/get-project-csv?projectId=${projectId}&type=${type}&timeline=${timeline}`,
          method: "GET",
          responseHandler: (response) => response.blob(),
        };
      },
    }),
    exportProjectSchedulePdf: builder.query({
      query: ({ projectId, type, timeline }) => {
        return {
          url: `/projectactivity/get-project-pdf?projectId=${projectId}&type=${type}&timeline=${timeline}`,
          method: "GET",
          responseHandler: (response) => response.blob(),
        };
      },
    }),
    updateReorderfromActivity: builder.mutation({
      query: ({ projectId }) => ({
        url: `projectactivity/reorderfromactivity/${projectId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Project"],
    }),

    updateDprLog: builder.mutation({
      query: ({
        projectId,
        activityId,
        todays_progress,
        date,
        remarks,
        status,
      }) => ({
        url: `projectactivity/${projectId}/updateDprLog/${activityId}`, // Adjust the URL as needed
        method: "PATCH",
        body: {
          todays_progress,
          date,
          remarks,
          status,
        },
      }),
      invalidatesTags: ["Project"],
    }),

    getAllDpr: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        projectId,
        from,
        to,
        onlyWithDeadline,
        status, 
        category,
        hide_status,
        status, 
      }) => {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(limit));

        if (projectId) params.set("projectId", projectId);
        if (search) params.set("search", search);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        if (onlyWithDeadline) params.set("onlyWithDeadline", onlyWithDeadline);
        if (status) params.set("status", status); // ✅ pass-through
        if (category) params.set("category", category);

        if (status) params.set("status", status); 
        if(hide_status) params.set("hide_status", hide_status)
        
        return {
          url: `projectActivity/alldpr?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Project"],
    }),

    getDprStatusCardsById: builder.query({
      query: (projectId) => ({
        url: `projectactivity/${encodeURIComponent(projectId)}/dprStatus`,
        method: "GET",
      }),
      providesTags: (_res, _err, projectId) => [
        { type: "Project", id: projectId ?? "default" },
      ],
    }),

    getProjectSummaryById: builder.query({
      query: (projectId) => ({
        url: `projectactivity/${encodeURIComponent(projectId)}/summary`,
        method: "GET",
      }),
      // Optional: normalize/guard the response so UI never breaks
      transformResponse: (res) => {
        const data = res?.data ?? {};
        return {
          success: !!res?.success,
          project_id: data.project_id ?? null,
          project_code: data.project_code ?? null,
          project_name: data.project_name ?? null,
          customer_name: data.customer_name ?? null,
          work_done_percent: Number(data.work_done_percent ?? 0),
          activities_past_deadline: Number(data.activities_past_deadline ?? 0),
          not_started_activities: Number(data.not_started_activities ?? 0),
          assigned_engineers: Array.isArray(data.assigned_engineers)
            ? data.assigned_engineers
            : [],
          activities: Array.isArray(data.activities) ? data.activities : [],
        };
      },
      providesTags: (_res, _err, projectId) => [
        { type: "Project", id: projectId ?? "default" },
      ],
    }),

    assignResources: builder.mutation({
      query: ({
        projectId,
        activityId,
        work_completion_unit,
        work_completion_value,
        resources,
      }) => ({
        url: `/projectactivity/assign-resources/${encodeURIComponent(
          projectId
        )}`,
        method: "PATCH",
        body: {
          activityId,
          work_completion_unit,
          work_completion_value,
          resources,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Project", id: arg.projectId },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useDeleteProjectMutation,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useGetAllProjectsQuery,
  useGetAllProjectsForLoanQuery,
  useExportLoanMutation,
  useGetProjectDropdownForDashboardQuery,
  useUpdateProjectStatusMutation,
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
  useGetProjectStatusFilterQuery,
  useUpdateProjectActivityMutation,
  usePushActivityToProjectMutation,
  useGetProjectActivityByProjectIdQuery,
  useUpdateActivityInProjectMutation,
  useGetActivityInProjectQuery,
  useLazyGetAllTemplateNameSearchQuery,
  useUpdateProjectActivityFromTemplateMutation,
  useGetAllProjectActivitiesQuery,
  useLazyGetAllProjectActivitiesQuery,
  useGetActivitiesByNameQuery,
  useLazyGetActivitiesByNameQuery,
  useGetAllModulesQuery,
  useLazyGetAllModulesQuery,
  useNameSearchActivityByProjectIdQuery,
  useLazyNameSearchActivityByProjectIdQuery,
  useNamesearchMaterialCategoriesQuery,
  useLazyNamesearchMaterialCategoriesQuery,
  useUpdateDependencyMutation,
  useGetRejectedOrNotAllowedDependenciesQuery,
  useLazyGetRejectedOrNotAllowedDependenciesQuery,
  useCreateApprovalMutation,
  useReorderProjectActivitiesMutation,
  useGetProjectStatesFilterQuery,
  useGetProjectDetailQuery,
  useGetActivityLineByProjectIdQuery,
  useGetPostsActivityFeedQuery,
  useGetProjectActivityForViewQuery,
  useGetResourcesQuery,
  useLazyGetResourcesQuery,
  useUpdateStatusOfPlanMutation,
  useExportProjectScheduleMutation,
  useExportProjectSchedulePdfQuery,
  useLazyExportProjectSchedulePdfQuery,
  useUpdateReorderfromActivityMutation,
  useUpdateDprLogMutation,
  useGetAllDprQuery,
  useGetDprStatusCardsByIdQuery,
  useGetProjectSummaryByIdQuery,

  useAssignResourcesMutation,
} = projectsApi;
