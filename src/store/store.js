import { configureStore } from "@reduxjs/toolkit";
import { engsAcCableApi } from "../redux/Eng/acsSlice";
import { engsBOSApi } from "../redux/Eng/bosSlice";
import { engsDcCableApi } from "../redux/Eng/dcsSlice";
import { engsHTPanelApi } from "../redux/Eng/htsSlice";
import { engsInverterApi } from "../redux/Eng/invertersSlice";
import { engsLTPanelApi } from "../redux/Eng/ltsSlice";
import { engsModuleApi } from "../redux/Eng/modulesSlice";
import { engsPoolingApi } from "../redux/Eng/poolingsSlice";
import { engsTransformerApi } from "../redux/Eng/transformersSlice";
import { expensesApi } from "../redux/expenseSlice";
import { templatesApi } from "../redux/Eng/templatesSlice";
import { billsApi } from "../redux/billsSlice";
import { camsApi } from "../redux/camsSlice";
import { commsApi } from "../redux/commsSlice";
import { engsApi } from "../redux/engsSlice";
import { loginsApi } from "../redux/loginSlice";
import { paymentsApi } from "../redux/paymentsSlice";
import { projectsApi } from "../redux/projectsSlice";
import { purchasesApi } from "../redux/purchasesSlice";
import { tasksApi } from "../redux/tasksSlice";
import { masterSheetApi } from "../redux/Eng/masterSheet";
import { GlobalTaskApi } from "../redux/globalTaskSlice";
import { AccountsApi } from "../redux/Accounts";
import { productsApi } from "../redux/productsSlice";
import { vendorsApi } from "../redux/vendorSlice";
import { poHistoryApi } from "../redux/poHistory";
import { inspectionApi } from "../redux/inspectionSlice";
import { postsApi } from "../redux/postsSlice";
import { approvalsApi } from "../redux/ApprovalsSlice";
import { leadsApi } from "../redux/leadsSlice";
import { emailApi } from "../redux/emailSlice";
import { documentApi } from "../redux/documentSlice";
import { loanApi } from "../redux/loanSlice";

export const store = configureStore({
  reducer: {
    [projectsApi.reducerPath]: projectsApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [purchasesApi.reducerPath]: purchasesApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [leadsApi.reducerPath]: leadsApi.reducer,
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
    [billsApi.reducerPath]: billsApi.reducer,
    [masterSheetApi.reducerPath]: masterSheetApi.reducer,
    [GlobalTaskApi.reducerPath]: GlobalTaskApi.reducer,
    [AccountsApi.reducerPath]: AccountsApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [vendorsApi.reducerPath]: vendorsApi.reducer,
    [poHistoryApi.reducerPath]: poHistoryApi.reducer,
    [inspectionApi.reducerPath]: inspectionApi.reducer,
    [postsApi.reducerPath]: postsApi.reducer,
    [approvalsApi.reducerPath]: approvalsApi.reducer,
    [emailApi.reducerPath]: emailApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
    [loanApi.reducerPath]: loanApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      projectsApi.middleware,
      paymentsApi.middleware,
      purchasesApi.middleware,
      tasksApi.middleware,
      leadsApi.middleware,
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
      templatesApi.middleware,
      billsApi.middleware,
      masterSheetApi.middleware,
      GlobalTaskApi.middleware,
      AccountsApi.middleware,
      productsApi.middleware,
      vendorsApi.middleware,
      poHistoryApi.middleware,
      inspectionApi.middleware,
      postsApi.middleware,
      approvalsApi.middleware,
      emailApi.middleware,
      documentApi.middleware,
      loanApi.middleware
    ),
});
