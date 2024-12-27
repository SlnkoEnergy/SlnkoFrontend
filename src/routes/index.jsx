import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import All_project_csv from "../csv/All_project_csv";
import AddMoney_Page from "../pages/Accounts/AddMoney_Page";
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

function index() {
  return (
    <>
      <Routes>
        {/*============ Pages ==========*/}

        {/*---------dashboard -------- */}
        <Route path="/" element={<Login />} />

        {/*------ User---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* <Route path="/User/add-user" element={<PrivateRoute><ProjectBalance /></PrivateRoute>} /> */}

        {/*------ BD ---------- */}
        {/* <Route path="/BD/initial-leads" element={<PrivateRoute><InitialLeads /></PrivateRoute>} />
          <Route path="/BD/commercial-offer" element={<PrivateRoute><CommercialOffer /></PrivateRoute>} /> */}

        {/*-------Accouting------- */}

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

        {/*----------SCM ----------*/}

        <Route
          path="/purchase-order"
          element={
            <PrivateRoute>
              <PurchaseOrder />
            </PrivateRoute>
          }
        />
        {/* <Route path="/SCM/material-tracker" element={<PrivateRoute><MaterialTracker /></PrivateRoute>} /> */}
        {/* <Route path="/SCM/vendor-bill" element={<PrivateRoute><VendorBill /></PrivateRoute>} /> */}

        {/*-------Project------- */}

        <Route
          path="/all-project"
          element={
            <PrivateRoute>
              <AllProjects />
            </PrivateRoute>
          }
        />
        {/* <Route path="/Projects/site-project" element ={<PrivateRoute><SiteProject /></PrivateRoute>} /> */}

        {/* If user goes to an undefined route, redirect to login */}
        <Route path="*" element={<Navigate to="/login" />} />

        <Route path="/csv" element={<All_project_csv />} />

        {/** -----------------All Forms -----------*/}
        <Route
          path="/add_project"
          element={
            <PrivateRoute>
              <AddProject />
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
      </Routes>
    </>
  );
}

export default index;
