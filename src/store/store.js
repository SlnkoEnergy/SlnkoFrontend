import { configureStore } from "@reduxjs/toolkit";
import { projectsApi } from "../redux/projectsSlice";
import { paymentsApi } from "../redux/paymentsSlice";
import { purchasesApi } from "../redux/purchasesSlice";
import { leadsApi } from "../redux/leadsSlice";
import { tasksApi } from "../redux/tasksSlice";
import { loginsApi } from "../redux/loginSlice";
import { commsApi } from "../redux/commsSlice";
import taskWorkReducer from "../redux/TaskDate_Manipulation/task_workSlice";
import { camsApi } from "../redux/camsSlice";
import { engsApi } from "../redux/engsSlice";
import { engsModuleApi } from "../redux/Eng/modulesSlice";
import { engsTransformerApi } from "../redux/Eng/transformersSlice";
import { engsInverterApi } from "../redux/Eng/invertersSlice";
import { engsPoolingApi } from "../redux/Eng/poolingsSlice";
import { engsBOSApi } from "../redux/Eng/bosSlice";
import { engsLTPanelApi } from "../redux/Eng/ltsSlice";
import { engsHTPanelApi } from "../redux/Eng/htsSlice";
import { engsAcCableApi } from "../redux/Eng/acsSlice";
import { engsDcCableApi } from "../redux/Eng/dcsSlice";
import { expensesApi } from "../redux/Expense/expenseSlice";
import { templatesApi } from "../redux/Eng/templatesSlice";

export const store = configureStore({
  reducer: {
    [projectsApi.reducerPath]: projectsApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [purchasesApi.reducerPath]: purchasesApi.reducer,
    [leadsApi.reducerPath]: leadsApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [loginsApi.reducerPath]: loginsApi.reducer,
    [commsApi.reducerPath]: commsApi.reducer,
    [camsApi.reducerPath]: camsApi.reducer,
    [engsApi.reducerPath]: engsApi.reducer,
    [engsModuleApi.reducerPath]: engsModuleApi.reducer,
    [engsTransformerApi.reducerPath]: engsTransformerApi.reducer,
    [engsInverterApi.reducerPath]: engsInverterApi.reducer,
    [engsPoolingApi.reducerPath]: engsPoolingApi.reducer,
    [engsBOSApi.reducerPath]: engsBOSApi.reducer,
    [engsLTPanelApi.reducerPath]: engsLTPanelApi.reducer,
    [engsHTPanelApi.reducerPath]: engsHTPanelApi.reducer,
    [engsAcCableApi.reducerPath]: engsAcCableApi.reducer,
    [engsDcCableApi.reducerPath]: engsDcCableApi.reducer,
    [expensesApi.reducerPath]: expensesApi.reducer,
    [templatesApi.reducerPath]: templatesApi.reducer,
    taskWork: taskWorkReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      projectsApi.middleware,
      paymentsApi.middleware,
      purchasesApi.middleware,
      leadsApi.middleware,
      tasksApi.middleware,
      loginsApi.middleware,
      commsApi.middleware,
      camsApi.middleware,
      engsApi.middleware,
      engsModuleApi.middleware,
      engsBOSApi.middleware,
      engsDcCableApi.middleware,
      engsAcCableApi.middleware,
      engsHTPanelApi.middleware,
      engsLTPanelApi.middleware,
      engsPoolingApi.middleware,
      engsInverterApi.middleware,
      engsTransformerApi.middleware,
      expensesApi.middleware,
      templatesApi.middleware
    ),
});
