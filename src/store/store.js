import { configureStore } from "@reduxjs/toolkit";
import { projectsApi } from "../redux/projectsSlice";
import { paymentsApi } from "../redux/paymentsSlice";
import { purchasesApi } from "../redux/purchasesSlice";

export const store = configureStore({
    reducer: {
        [projectsApi.reducerPath]: projectsApi.reducer,
        [paymentsApi.reducerPath]: paymentsApi.reducer,
        [purchasesApi.reducerPath]: purchasesApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            projectsApi.middleware,
            paymentsApi.middleware,
            purchasesApi.middleware
        ),
});
