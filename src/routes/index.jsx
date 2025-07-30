import { Navigate, Route, Routes } from "react-router-dom";
import AddMoney_Page from "../pages/Accounts/AddMoney_Page";
import AddPayment_Request from "../pages/Accounts/AddPayment_Request";
import PaymentUTR from "../pages/Accounts/Payment_UTR";
import PaymentApproval from "../pages/Accounts/PaymentApproval";
import PaymentApproved from "../pages/Accounts/PaymentApproved";
import Payment_Detail from "../pages/Accounts/PaymentDetail";
import PaymentRequest from "../pages/Accounts/PaymentRequest";
import PaySummary from "../pages/Accounts/PaySummary";
import ProjectBalance from "../pages/Accounts/ProjectBalance";
import StandByRecords from "../pages/Accounts/StandByRecords";
import StandBy_ReqSummary from "../pages/Accounts/StandByRequest";
import ViewDetail from "../pages/Accounts/ViewDetail";
import Offer_Form from "../pages/BD/Add_Offer";
import BDHistory from "../pages/BD/BDHistory";
import CommercialOffer from "../pages/BD/Comm_Offer";
import OfferSummary from "../pages/BD/Offer_Summary";
import AddProject from "../pages/Projects/Add_Project";
import AllProjects from "../pages/Projects/AllProject";
import BillHistory from "../pages/Projects/BillHistory";
import Edit_Project from "../pages/Projects/Edit_Project";
import POHistory from "../pages/Projects/PoHistory";
import Add_Bill from "../pages/SCM/AddBill";
import Add_Purchase from "../pages/SCM/AddPO";
import Add_Vendor from "../pages/SCM/AddVendor";
import Edit_Po from "../pages/SCM/EditPO";
import PurchaseOrder from "../pages/SCM/POSummary";
import VendorBill from "../pages/SCM/VendorBill";
import AddUser from "../pages/Users/AddUser";
import ForgotPassword from "../pages/Users/auth/ForgotPassword";
import Login from "../pages/Users/auth/Login";
import EditUser from "../pages/Users/EditUser";
// import { BalanceProvider } from "../store/Context/Balance_Context";
import Add_Adjusment from "../pages/Accounts/Adjust_Request";
import Offer_edit from "../pages/BD/Comm_/EditOffer";
import ListReference3 from "../pages/BD/Comm_/offer_previw";
import ListReference from "../pages/BD/Comm_/offer_ref";
import ListReference2 from "../pages/BD/Comm_/offer_ref_edit";
import Costing_form from "../pages/BD/Costing_form";
import Task_Dashboards from "../pages/BD/DashTask";
import Add_Lead from "../pages/BD/Leads/create_Leads";
import DEADSummary from "../pages/BD/Leads/Dead/Forms/dead_Summary";
import CheckboxModal4 from "../pages/BD/Leads/Dead/Forms/DeadToAll";
import Follow_History from "../pages/BD/Leads/Followup/Followup_History";
import Edit_Followup_Leads from "../pages/BD/Leads/Followup/Forms/follow_edit";
import FollowUpSummary from "../pages/BD/Leads/Followup/Forms/follow_Summary";
import Add_Task_Followup from "../pages/BD/Leads/Followup/Forms/FollowupTask";
import CheckboxModal2 from "../pages/BD/Leads/Followup/Forms/FollowupToAll";
import BDHandSheet from "../pages/BD/Leads/get_BD_Over";
import GetHandSheet from "../pages/BD/Leads/getHand_Over";
import HandSheet from "../pages/BD/Leads/HandOver";
import Edit_Initial_Leads from "../pages/BD/Leads/Initial/Forms/initial_edit";
import Sum_Initial_Leads from "../pages/BD/Leads/Initial/Forms/initial_Summary";
import Add_Task_Initial from "../pages/BD/Leads/Initial/Forms/InitialTask";
import CheckboxModal from "../pages/BD/Leads/Initial/Forms/InitialToAll";
import Initial_History from "../pages/BD/Leads/Initial/Initial_History";
import Initial_Leads from "../pages/BD/Leads/Initial/Initial_Leads_Tab";
import Edit_Warm_Leads from "../pages/BD/Leads/Warm/Forms/warm_edit";
import WarmUpSummary from "../pages/BD/Leads/Warm/Forms/warm_Summary";
import Add_Task_Warm from "../pages/BD/Leads/Warm/Forms/WarmTask";
import CheckboxModal3 from "../pages/BD/Leads/Warm/Forms/WarmToAll";
import Warm_History from "../pages/BD/Leads/Warm/Warm_History";
import Edit_Won_Leads from "../pages/BD/Leads/Won/Forms/won_edit";
import WONSummary from "../pages/BD/Leads/Won/Forms/won_Summary";
import Add_Task_Won from "../pages/BD/Leads/Won/Forms/WonTask";
import Sum_Won_Leads from "../pages/BD/Leads/Won/Forms/WonToAll";
import Won_History from "../pages/BD/Leads/Won/Won_History";
import CommercialRateOffer from "../pages/BD/OfferRate";
import Approval_Dashboard from "../pages/CAM/ApprovalHandOver";
import Dashboard from "../pages/CAM/DashboardCam";
import EditCamHandSheet from "../pages/CAM/Edit_Cam";
import EditOpsHandSheet from "../pages/CAM/Edit_Ops";
import EditHandSheet from "../pages/CAM/EditHand_over";
import ViewHandSheet from "../pages/CAM/HandOver_View";
import Dashboardz from "../pages/Dashboards";
import DashboardENG from "../pages/Eng/DashboardEng";
import Process_Tracker from "../pages/Eng/Er_Process";
import ModuleSheet from "../pages/Eng/ModuleDashboard";
import Accounts_Expense from "../pages/ExpenseSheet/Expense_Accounts";
import ApprovalExpense from "../pages/ExpenseSheet/Expense_Approval";
import Add_Expense from "../pages/ExpenseSheet/Expense_Form";
import Hr_Expense from "../pages/ExpenseSheet/Expense_HR";
import Expense_Table from "../pages/ExpenseSheet/Expense_Tab";
import Edit_Expense from "../pages/ExpenseSheet/Update_Expense_Form";
import Update_Bill from "../pages/SCM/EditBill";
import PrivateRoute from "./PrivateRoute";
import TempDashboard from "../pages/Eng/Template_Dashboard";
import AddFolder from "../pages/Eng/Forms/Add_folder";
import Template_Pages from "../pages/Eng/Templates_Page";
import AddTemplates from "../pages/Eng/Forms/Add_Templates";
import Overview from "../component/Forms/Engineering/Eng_Overview/Overview";
import Eng_Overview from "../pages/Eng/Eng_Overview";
import Update_Expense from "../pages/ExpenseSheet/Expense_Accounts_HR";
import Add_Material_Category from "../pages/Eng/Forms/Add_Material_Category";
import Add_Material from "../pages/Eng/Forms/Add_Material";
import AddBoq from "../pages/Eng/AddBoq";
import View_Project from "../component/Forms/View_Project";
import ProjectDetail from "../pages/CAM/ProjectDetail";
import PurchaseRequestSheet from "../pages/CAM/PurchaseRequest";
import PurchaseReqDetails from "../pages/CAM/PurchaseRequestDetail";
import Add_Task from "../pages/AllTask/ADD_Task";
import AllTask from "../pages/AllTask/AllTask";
import View_Task from "../pages/AllTask/View_Task";


function index() {
  return (
    <Routes>
      {/*============ Pages ==========*/}

      {/*---------dashboard -------- */}
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboardz />
          </PrivateRoute>
        }
      />

      {/*------ User---------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/add_user"
        element={
          <PrivateRoute>
            <AddUser />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit_user"
        element={
          <PrivateRoute>
            <EditUser />
          </PrivateRoute>
        }
      />
      {/*-------BD------- */}
      <Route
        path="/comm_offer"
        element={
          <PrivateRoute>
            <CommercialOffer />
          </PrivateRoute>
        }
      />
      <Route
        path="/ref_list_add"
        element={
          <PrivateRoute>
            <ListReference />
          </PrivateRoute>
        }
      />
      <Route
        path="/ref_list_update"
        element={
          <PrivateRoute>
            <ListReference2 />
          </PrivateRoute>
        }
      />
      <Route
        path="/bd_history"
        element={
          <PrivateRoute>
            <BDHistory />
          </PrivateRoute>
        }
      />

      <Route
        path="/offer_preview"
        element={
          <PrivateRoute>
            <ListReference3 />
          </PrivateRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <PrivateRoute>
            <Initial_Leads />
          </PrivateRoute>
        }
      />
      {/*-------Accounting------- */}
      <Route
        path="/project-balance"
        element={
          <PrivateRoute>
            {/* <BalanceProvider> */}
            <ProjectBalance />
            {/* </BalanceProvider> */}
          </PrivateRoute>
        }
      />
      <Route
        path="/daily-payment-request"
        element={
          <PrivateRoute>
            <PaymentRequest />
          </PrivateRoute>
        }
      />
      <Route
        path="/payment-approval"
        element={
          <PrivateRoute>
            <PaymentApproval />
          </PrivateRoute>
        }
      />
      <Route
        path="/payment-approved"
        element={
          <PrivateRoute>
            <PaymentApproved />
          </PrivateRoute>
        }
      />
      <Route
        path="/view_detail"
        element={
          <PrivateRoute>
            <ViewDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/standby_records"
        element={
          <PrivateRoute>
            <StandByRecords />
          </PrivateRoute>
        }
      />
      <Route
        path="/payment_detail"
        element={
          <PrivateRoute>
            <Payment_Detail />
          </PrivateRoute>
        }
      />
      <Route
        path="/utr_submission"
        element={
          <PrivateRoute>
            <PaymentUTR />
          </PrivateRoute>
        }
      />

      {/*----------SCM ----------*/}
      <Route
        path="/purchase-order"
        element={
          <PrivateRoute>
            <PurchaseOrder />
          </PrivateRoute>
        }
      />
      <Route
        path="/bill_history"
        element={
          <PrivateRoute>
            <BillHistory />
          </PrivateRoute>
        }
      />
      <Route
        path="/po_history"
        element={
          <PrivateRoute>
            <POHistory />
          </PrivateRoute>
        }
      />
      <Route
        path="/vendor_bill"
        element={
          <PrivateRoute>
            <VendorBill />
          </PrivateRoute>
        }
      />

      {/*-------Project------- */}
      <Route
        path="/all-project"
        element={
          <PrivateRoute>
            <AllProjects />
          </PrivateRoute>
        }
      />
      <Route
        path="/view-project"
        element={
          <PrivateRoute>
            <View_Project />
          </PrivateRoute>
        }
      />

      {/*-------------CAM----------*/}
      <Route
        path="/cam_dash"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/handover_dash"
        element={
          <PrivateRoute>
            <Approval_Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/project_detail"
        element={
          <PrivateRoute>
            <ProjectDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/purchase_detail"
        element={
          <PrivateRoute>
            <PurchaseReqDetails />
          </PrivateRoute>
        }
      />

      {/*-------------Eng----------*/}
      <Route
        path="/eng_dash"
        element={
          <PrivateRoute>
            <DashboardENG />
          </PrivateRoute>
        }
      />
      <Route
        path="/temp_dash"
        element={
          <PrivateRoute>
            <TempDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/module_sheet"
        element={
          <PrivateRoute>
            <ModuleSheet />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_material_category"
        element={
          <PrivateRoute>
            <Add_Material_Category />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_material"
        element={
          <PrivateRoute>
            <Add_Material />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_folder"
        element={
          <PrivateRoute>
            <AddFolder />
          </PrivateRoute>
        }
      />

      <Route
        path="/temp_pages"
        element={
          <PrivateRoute>
            <Template_Pages />
          </PrivateRoute>
        }
      />

      <Route
        path="/add_templates"
        element={
          <PrivateRoute>
            <AddTemplates />
          </PrivateRoute>
        }
      />

      <Route
        path="/overview"
        element={
          <PrivateRoute>
            <Eng_Overview />
          </PrivateRoute>
        }
      />

      <Route
        path="/add_boq"
        element={
          <PrivateRoute>
            <AddBoq />
          </PrivateRoute>
        }
      />

      <Route
        path="/process_track"
        element={
          <PrivateRoute>
            <Process_Tracker />
          </PrivateRoute>
        }
      />

      {/* If user goes to an undefined route, redirect to login */}
      <Route path="*" element={<Navigate to="/login" />} />

      {/* -----------------All Forms -----------*/}
      <Route
        path="/add_project"
        element={
          <PrivateRoute>
            <AddProject />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit_project"
        element={
          <PrivateRoute>
            <Edit_Project />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_money"
        element={
          <PrivateRoute>
            <AddMoney_Page />
          </PrivateRoute>
        }
      />
      <Route
        path="/pay_request"
        element={
          <PrivateRoute>
            <AddPayment_Request />
          </PrivateRoute>
        }
      />
      <Route
        path="/adjust_request"
        element={
          <PrivateRoute>
            <Add_Adjusment />
          </PrivateRoute>
        }
      />
      <Route
        path="/pay_summary"
        element={
          <PrivateRoute>
            <PaySummary />
          </PrivateRoute>
        }
      />
      <Route
        path="/offer_summary"
        element={
          <PrivateRoute>
            <OfferSummary />
          </PrivateRoute>
        }
      />
      <Route
        path="/standby_Request"
        element={
          <PrivateRoute>
            <StandBy_ReqSummary />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_po"
        element={
          <PrivateRoute>
            <Add_Purchase />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_vendor"
        element={
          <PrivateRoute>
            <Add_Vendor />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_bill"
        element={
          <PrivateRoute>
            <Add_Bill />
          </PrivateRoute>
        }
      />

      <Route
        path="/edit_bill"
        element={
          <PrivateRoute>
            <Update_Bill />
          </PrivateRoute>
        }
      />

      <Route
        path="/edit_po"
        element={
          <PrivateRoute>
            <Edit_Po />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_offer"
        element={
          <PrivateRoute>
            <Offer_Form />
          </PrivateRoute>
        }
      />
      <Route
        path="/offer_rate"
        element={
          <PrivateRoute>
            <CommercialRateOffer />
          </PrivateRoute>
        }
      />
      <Route
        path="/costing_input"
        element={
          <PrivateRoute>
            <Costing_form />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_lead"
        element={
          <PrivateRoute>
            <Add_Lead />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit_initial"
        element={
          <PrivateRoute>
            <Edit_Initial_Leads />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit_followup"
        element={
          <PrivateRoute>
            <Edit_Followup_Leads />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit_warm"
        element={
          <PrivateRoute>
            <Edit_Warm_Leads />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit_won"
        element={
          <PrivateRoute>
            <Edit_Won_Leads />
          </PrivateRoute>
        }
      />
      <Route
        path="/initial_Summary"
        element={
          <PrivateRoute>
            <Sum_Initial_Leads />
          </PrivateRoute>
        }
      />
      <Route
        path="/followup_Summary"
        element={
          <PrivateRoute>
            <FollowUpSummary />
          </PrivateRoute>
        }
      />
      <Route
        path="/warm_Summary"
        element={
          <PrivateRoute>
            <WarmUpSummary />
          </PrivateRoute>
        }
      />
      <Route
        path="/won_Summary"
        element={
          <PrivateRoute>
            <WONSummary />
          </PrivateRoute>
        }
      />
      <Route
        path="/dead_Summary"
        element={
          <PrivateRoute>
            <DEADSummary />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_task_initial"
        element={
          <PrivateRoute>
            <Add_Task_Initial />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_task_followup"
        element={
          <PrivateRoute>
            <Add_Task_Followup />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_task_warm"
        element={
          <PrivateRoute>
            <Add_Task_Warm />
          </PrivateRoute>
        }
      />
      <Route
        path="/add_task_won"
        element={
          <PrivateRoute>
            <Add_Task_Won />
          </PrivateRoute>
        }
      />
      <Route
        path="/dash_task"
        element={
          <PrivateRoute>
            <Task_Dashboards />
          </PrivateRoute>
        }
      />
      <Route
        path="/hand_over"
        element={
          <PrivateRoute>
            <HandSheet />
          </PrivateRoute>
        }
      />
      <Route
        path="/bd_hand_over"
        element={
          <PrivateRoute>
            <BDHandSheet />
          </PrivateRoute>
        }
      />
      <Route
        path="/get_hand_over"
        element={
          <PrivateRoute>
            <GetHandSheet />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit_handover"
        element={
          <PrivateRoute>
            <EditHandSheet />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit_ops_handover"
        element={
          <PrivateRoute>
            <EditOpsHandSheet />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit_cam_handover"
        element={
          <PrivateRoute>
            <EditCamHandSheet />
          </PrivateRoute>
        }
      />
      <Route
        path="/view_handover"
        element={
          <PrivateRoute>
            <ViewHandSheet />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit_offer"
        element={
          <PrivateRoute>
            <Offer_edit />
          </PrivateRoute>
        }
      />
      <Route
        path="/initial_records"
        element={
          <PrivateRoute>
            <Initial_History />
          </PrivateRoute>
        }
      />
      <Route
        path="/followup_records"
        element={
          <PrivateRoute>
            <Follow_History />
          </PrivateRoute>
        }
      />
      <Route
        path="/warm_records"
        element={
          <PrivateRoute>
            <Warm_History />
          </PrivateRoute>
        }
      />
      <Route
        path="/won_records"
        element={
          <PrivateRoute>
            <Won_History />
          </PrivateRoute>
        }
      />
      <Route
        path="/purchase_request"
        element={
          <PrivateRoute>
            <PurchaseRequestSheet />
          </PrivateRoute>
        }
      />

      {/***************All Stages *************/}
      <Route
        path="/initial_to_all"
        element={
          <PrivateRoute>
            <CheckboxModal />
          </PrivateRoute>
        }
      />
      <Route
        path="/followup_to_all"
        element={
          <PrivateRoute>
            <CheckboxModal2 />
          </PrivateRoute>
        }
      />
      <Route
        path="/warm_to_all"
        element={
          <PrivateRoute>
            <CheckboxModal3 />
          </PrivateRoute>
        }
      />
      <Route
        path="/won_to_all"
        element={
          <PrivateRoute>
            <Sum_Won_Leads />
          </PrivateRoute>
        }
      />
      <Route
        path="/dead_to_initial"
        element={
          <PrivateRoute>
            <CheckboxModal4 />
          </PrivateRoute>
        }
      />

      {/****** Expense Sheet */}
      <Route
        path="/add_expense"
        element={
          <PrivateRoute>
            <Add_Expense />
          </PrivateRoute>
        }
      />

      <Route
        path="/edit_expense"
        element={
          <PrivateRoute>
            <Edit_Expense />
          </PrivateRoute>
        }
      />
      <Route
        path="/update_expense"
        element={
          <PrivateRoute>
            <Update_Expense />
          </PrivateRoute>
        }
      />
      <Route
        path="/expense_dashboard"
        element={
          <PrivateRoute>
            <Expense_Table />
          </PrivateRoute>
        }
      />

      <Route
        path="/expense_approval"
        element={
          <PrivateRoute>
            <ApprovalExpense />
          </PrivateRoute>
        }
      />

      <Route
        path="/expense_hr"
        element={
          <PrivateRoute>
            <Hr_Expense />
          </PrivateRoute>
        }
      />

      <Route
        path="/expense_accounts"
        element={
          <PrivateRoute>
            <Accounts_Expense />
          </PrivateRoute>
        }
      />
  
      <Route
        path="/add_task"
        element={
          <PrivateRoute>
            <Add_Task />
          </PrivateRoute>
        }
      />

       <Route
        path="/all_task"
        element={
          <PrivateRoute>
            <AllTask />
          </PrivateRoute>
        }
      />

      <Route
        path="/view_task"
        element={
          <PrivateRoute>
            <View_Task />
          </PrivateRoute>
        }
      />
     
    </Routes>
  );
}

export default index;
