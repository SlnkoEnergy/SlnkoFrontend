import React from 'react'
import AllProjects from '../pages/Projects/AllProject';
import ProjectBalance from '../pages/Accounts/ProjectBalance';
import PurchaseOrder from '../pages/SCM/POSummary';
import { Route, Routes } from 'react-router-dom';
import Login from '../pages/Users/auth/Login';

function index() {
  return (
    <>
    <Routes>
{/*============ Pages ==========*/}

    {/*---------dashboard -------- */}
          <Route path="/" element={<AllProjects />} />

    {/*------ User---------- */}
            <Route path='/login' element={<Login />} ></Route>
          {/* <Route path="/User/add-user" element={<ProjectBalance />} ></Route> */}

    {/*------ BD ---------- */}
          {/* <Route path="/BD/initial-leads" element={<InitialLeads />} ></Route>
          <Route path="/BD/commercial-offer" element={<CommercialOffer />} ></Route> */}
    
    {/*-------Accouting------- */}
    

          <Route path="/project-balance" element={<ProjectBalance />} ></Route>
          {/* <Route path="/Accounts/daily-payment-request" element={<PaymentRequest/>} ></Route>
          <Route path="/Accounts/payment-approval" element={<PaymentApproval/>} ></Route>
          <Route path="/Accounts/payment-approved" element={<PaymentApproved />} ></Route> */}



          {/*----------SCM ----------*/}

          <Route path="/purchase-order" element={<PurchaseOrder />} ></Route>
          {/* <Route path="/SCM/material-tracker" element={<MaterialTracker />} ></Route> */}
          {/* <Route path="/SCM/vendor-bill" element={<VendorBill />} ></Route> */}
      

        {/*-------Project------- */}
        
            <Route path="/all-project" element ={<AllProjects />} ></Route>
            {/* <Route path="/Projects/site-project" element ={<SiteProject />} ></Route> */}

        


    </Routes>
    </>
  )
}

export default index;