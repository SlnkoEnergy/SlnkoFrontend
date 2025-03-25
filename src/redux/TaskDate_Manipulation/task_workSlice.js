import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isBefore, isToday, isTomorrow, parseISO } from "date-fns";
import { useGetEntireLeadsQuery } from "../leadsSlice";
import { useGetTasksQuery } from "../tasksSlice";


export const fetchTasksAndLeads = createAsyncThunk(
  "tasks/fetchTasksAndLeads",
  async (_, { rejectWithValue, dispatch, extra }) => {
    try {
      console.log("Fetching leads and tasks...");

      if (!extra?.leadsApi || !extra?.tasksApi) {
        throw new Error("API instances not available in extra");
      }

      const leadsResponse = await dispatch(extra.leadsApi.endpoints.getEntireLeads.initiate()).unwrap();
      console.log("Leads Response:", leadsResponse);

      const tasksResponse = await dispatch(extra.tasksApi.endpoints.getTasks.initiate()).unwrap();
      console.log("Tasks Response:", tasksResponse);

      const leadsArray = [
        ...(leadsResponse?.lead?.initialdata || []),
        ...(leadsResponse?.lead?.followupdata || []),
        ...(leadsResponse?.lead?.warmdata || []),
        ...(leadsResponse?.lead?.wondata || []),
        ...(leadsResponse?.lead?.deaddata || []),
      ];

      return { leads: leadsArray, tasks: tasksResponse.data || [] };
    } catch (error) {
      console.error("API Fetch Error:", error);
      return rejectWithValue(error.message);
    }
  }
);





const taskWorkSlice = createSlice({
  name: "tasks",
  initialState: {
    leads: [],
    tasks: [],
    categorizedTasks: {
      past: [],
      today: [],
      tomorrow: [],
      future: [],
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksAndLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasksAndLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.leads;
        state.tasks = action.payload.tasks;

       
        const categorizedTasks = {
          past: [],
          today: [],
          tomorrow: [],
          future: [],
        };

        const now = new Date();

        action.payload.tasks.forEach((task) => {
          if (!task.date) return;

          const taskDate = parseISO(task.date);
          const associatedLead = action.payload.leads.find(
            (lead) => String(lead.id) === String(task.lead_id)
          );

          if (!associatedLead) return;

          const taskEntry = {
            name: associatedLead.c_name || "Unknown",
            company: associatedLead.company || "N/A",
            location: `${associatedLead.district || "Unknown"}, ${associatedLead.state || "Unknown"}`,
            type: task.reference,
            icon: task.reference === "byCall" ? "📞" : "👤",
          };

          if (isBefore(taskDate, now) && !isToday(taskDate)) {
            categorizedTasks.past.push(taskEntry);
          } else if (isToday(taskDate)) {
            categorizedTasks.today.push(taskEntry);
          } else if (isTomorrow(taskDate)) {
            categorizedTasks.tomorrow.push(taskEntry);
          } else {
            categorizedTasks.future.push(taskEntry);
          }
        });

        state.categorizedTasks = categorizedTasks;
      })
      .addCase(fetchTasksAndLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default taskWorkSlice.reducer;
