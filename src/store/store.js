import { configureStore } from "@reduxjs/toolkit";
import { projectsApi } from "../redux/projectsSlice";
import { paymentsApi } from "../redux/paymentsSlice";
import { purchasesApi } from "../redux/purchasesSlice";
import { leadsApi } from "../redux/leadsSlice";

export const store = configureStore({
    reducer: {
        [projectsApi.reducerPath]: projectsApi.reducer,
        [paymentsApi.reducerPath]: paymentsApi.reducer,
        [purchasesApi.reducerPath]: purchasesApi.reducer,
        [leadsApi.reducerPath]: leadsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            projectsApi.middleware,
            paymentsApi.middleware,
            purchasesApi.middleware,
            leadsApi.middleware
        ),
});
