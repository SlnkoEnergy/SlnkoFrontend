import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import All_project_csv from "../csv/All_project_csv";
import AddMoney_Page from "../pages/Accounts/AddMoney_Page";
import AddPayment_Request from "../pages/Accounts/AddPayment_Request";
import PaymentApproval from "../pages/Accounts/PaymentApproval";
import PaymentApproved from "../pages/Accounts/PaymentApproved";
import PaymentRequest from "../pages/Accounts/PaymentRequest";
import ProjectBalance from "../pages/Accounts/ProjectBalance";
import AddProject from "../pages/Projects/Add_Project";
import AllProjects from "../pages/Projects/AllProject";
import PurchaseOrder from "../pages/SCM/POSummary";
import ForgotPassword from "../pages/Users/auth/ForgotPassword";
import Login from "../pages/Users/auth/Login";
import PrivateRoute from "./PrivateRoute";
import Edit_Project from "../pages/Projects/Edit_Project";
import ViewDetail from "../pages/Accounts/ViewDetail";
import PaySummary from "../pages/Accounts/PaySummary";
import StandBy_ReqSummary from "../pages/Accounts/StandByRequest";
import StandByRecords from "../pages/Accounts/StandByRecords";
import AddUser from "../pages/Users/AddUser";
import EditUser from "../pages/Users/EditUser";
import Payment_Detail from "../pages/Accounts/PaymentDetail";
import Add_Purchase from "../pages/SCM/AddPO";
import Add_Vendor from "../pages/SCM/AddVendor";
import Add_Bill from "../pages/SCM/AddBill";
import Edit_Po from "../pages/SCM/EditPO"
import BillHistory from "../pages/Projects/BillHistory";
import POHistory from "../pages/Projects/PoHistory";

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

    {/*-------Accounting------- */}
    <Route
      path="/project-balance"
      element={
        <PrivateRoute>
          <ProjectBalance />
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
  </Routes>
  );
}

export default index;
