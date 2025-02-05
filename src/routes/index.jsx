import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AddMoney_Page from "../pages/Accounts/AddMoney_Page";
import AddPayment_Request from "../pages/Accounts/AddPayment_Request";
import PaymentApproval from "../pages/Accounts/PaymentApproval";
import PaymentApproved from "../pages/Accounts/PaymentApproved";
import Payment_Detail from "../pages/Accounts/PaymentDetail";
import PaymentRequest from "../pages/Accounts/PaymentRequest";
import PaySummary from "../pages/Accounts/PaySummary";
import ProjectBalance from "../pages/Accounts/ProjectBalance";
import StandByRecords from "../pages/Accounts/StandByRecords";
import StandBy_ReqSummary from "../pages/Accounts/StandByRequest";
import ViewDetail from "../pages/Accounts/ViewDetail";
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
import AddUser from "../pages/Users/AddUser";
import ForgotPassword from "../pages/Users/auth/ForgotPassword";
import Login from "../pages/Users/auth/Login";
import EditUser from "../pages/Users/EditUser";
import VendorBill from "../pages/SCM/VendorBill";
import PaymentUTR from "../pages/Accounts/Payment_UTR";
import CommercialOffer from "../pages/BD/Comm_Offer";
import Offer_Form from "../pages/BD/Add_Offer";
// import { BalanceProvider } from "../store/Context/Balance_Context";
import PrivateRoute from "./PrivateRoute";
import Testing from "../component/testing";

function index() {
  return (
    <Routes>
      {/*============ Pages ==========*/}

      {/*---------dashboard -------- */}
      <Route path="/" element={<Login />} />

      {/*------ User---------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="add_user"
        element={
          <PrivateRoute>
            <AddUser />
          </PrivateRoute>
        }
      />
      <Route
        path="edit_user"
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
        path="/pay_summary"
        element={
          <PrivateRoute>
            <PaySummary />
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
    </Routes>
  );
}

export default index;
