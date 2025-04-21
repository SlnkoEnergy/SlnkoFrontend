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
        taskWork: taskWorkReducer
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
            engsApi.middleware
        ),
});
