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
import Edit_Project from "../pages/Projects/Edit_Project";
import POHistory from "../pages/Projects/PoHistory";
import Add_Bill from "../pages/SCM/AddBill";
import Add_Purchase from "../pages/SCM/AddPO";
import Add_Vendor from "../pages/SCM/AddVendor";
import PurchaseOrder from "../pages/SCM/POSummary";
import VendorBill from "../pages/SCM/VendorBill";
import AddUser from "../pages/Users/AddUser";
import ForgotPassword from "../pages/Users/auth/ForgotPassword";
import Login from "../pages/Users/auth/Login";
import EditUser from "../pages/Users/EditUser";
import Add_Adjusment from "../pages/Accounts/Adjust_Request";
import Offer_edit from "../pages/BD/Comm_/EditOffer";
import ListReference3 from "../pages/BD/Comm_/offer_previw";
import ListReference from "../pages/BD/Comm_/offer_ref";
import ListReference2 from "../pages/BD/Comm_/offer_ref_edit";
import Costing_form from "../pages/BD/Costing_form";
import CommercialRateOffer from "../pages/BD/OfferRate";
import Approval_Dashboard from "../pages/CAM/ApprovalHandOver";
import Dashboard from "../pages/CAM/DashboardCam";
import EditCamHandSheet from "../pages/CAM/Edit_Cam";
import EditOpsHandSheet from "../pages/CAM/Edit_Ops";
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
import PrivateRoute from "./PrivateRoute";
import TempDashboard from "../pages/Eng/Template_Dashboard";
import AddFolder from "../pages/Eng/Forms/Add_folder";
import Template_Pages from "../pages/Eng/Templates_Page";
import AddTemplates from "../pages/Eng/Forms/Add_Templates";
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
import SalesIframe from "../component/Sales_Iframe";
import Logistics from "../pages/SCM/Logistics";
import Products from "../pages/Databases/Products";
import Categories from "../pages/Databases/Categories";
import Product_Form from "../pages/Databases/Product_Form";
import PurchaseRequestForm from "../pages/CAM/PurchaseRequestForm";
import LogisticsForm from "../pages/SCM/LogisticsForm";
import Inspection from "../pages/Eng/Inspection";
import Inspection_Form from "../pages/Eng/Inspection_Form";
import Category_Form from "../pages/Databases/Category_Form";
import UserProfile from "../pages/Users/UserProfile";
import TaskDashboard from "../pages/AllTask/Dashboard";
import ProjectManagement from "../pages/Projects/ProjectManagement";
import ViewProjectManagement from "../pages/Projects/ViewProjectManagement";
import ProjectTemplate from "../pages/Projects/ProjectTemplates";
import MyApproval from "../pages/Approvals/MyApproval";
import ApprovalDashboard from "../pages/Approvals/ApprovalDashboard";
import MyRequest from "../pages/Approvals/MyRequest";
import ProjectDashBoard from "../pages/Projects/ProjectDashboard";
import Vendors from "../pages/SCM/Vendors";
import ViewVendors from "../pages/SCM/ViewVendor";
import Email from "../pages/Emails/Email";
import Template from "../pages/Emails/Template";
import ProjectScope from "../pages/CAM/ProjectScope";

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
        path="/user_profile"
        element={
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        }
      />

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
        path="/sales"
        element={
          <PrivateRoute>
            <SalesIframe />
          </PrivateRoute>
        }
      />

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
        path="/po_history"
        element={
          <PrivateRoute>
            <POHistory />
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
        path="/vendor_bill"
        element={
          <PrivateRoute>
            <VendorBill />
          </PrivateRoute>
        }
      />
      <Route
        path="/vendors"
        element={
          <PrivateRoute>
            <Vendors />
          </PrivateRoute>
        }
      />
      <Route
        path="/view_vendor"
        element={
          <PrivateRoute>
            <ViewVendors />
          </PrivateRoute>
        }
      />
      <Route
        path="/email"
        element={
          <PrivateRoute>
            <Email />
          </PrivateRoute>
        }
      />
      <Route
        path="/email_template"
        element={
          <PrivateRoute>
            <Template />
          </PrivateRoute>
        }
      />
      <Route
        path="/logistics"
        element={
          <PrivateRoute>
            <Logistics />
          </PrivateRoute>
        }
      />
      <Route
        path="/logistics-form"
        element={
          <PrivateRoute>
            <LogisticsForm />
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
      <Route
        path="/project_management"
        element={
          <PrivateRoute>
            <ProjectManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/project_dash"
        element={
          <PrivateRoute>
            <ProjectDashBoard />
          </PrivateRoute>
        }
      />
      <Route
        path="/view_pm"
        element={
          <PrivateRoute>
            <ViewProjectManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/project_template"
        element={
          <PrivateRoute>
            <ProjectTemplate />
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
      <Route
        path="/pr_form"
        element={
          <PrivateRoute>
            <PurchaseRequestForm />
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
        path="/inspection"
        element={
          <PrivateRoute>
            <Inspection />
          </PrivateRoute>
        }
      />
      <Route
        path="/inspection_form"
        element={
          <PrivateRoute>
            <Inspection_Form />
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
        path="/add_bill"
        element={
          <PrivateRoute>
            <Add_Bill />
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
        path="/edit_offer"
        element={
          <PrivateRoute>
            <Offer_edit />
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

      <Route
        path="/project_scope"
        element={
          <PrivateRoute>
            <ProjectScope />
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

      <Route
        path="/task_dashboard"
        element={
          <PrivateRoute>
            <TaskDashboard />
          </PrivateRoute>
        }
      />

      {/* Databases */}
      <Route
        path="/products"
        element={
          <PrivateRoute>
            <Products />
          </PrivateRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <PrivateRoute>
            <Categories />
          </PrivateRoute>
        }
      />

      <Route
        path="/product_form"
        element={
          <PrivateRoute>
            <Product_Form />
          </PrivateRoute>
        }
      />

      <Route
        path="/category_form"
        element={
          <PrivateRoute>
            <Category_Form />
          </PrivateRoute>
        }
      />

      {/* Approvals */}
      <Route
        path="/approval_dashboard"
        element={
          <PrivateRoute>
            <ApprovalDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/my_requests"
        element={
          <PrivateRoute>
            <MyRequest />
          </PrivateRoute>
        }
      />
      <Route
        path="/my_approvals"
        element={
          <PrivateRoute>
            <MyApproval />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default index;
