import { StackClientApp } from "@stackframe/react";
import { useNavigate } from "react-router-dom";

export const stackClientApp = new StackClientApp({
  // You should store these in environment variables based on your project setup
  //! to be added in environment variables
  projectId: "8b39fccc-1657-4320-8df0-d7caf86db049",
  publishableClientKey: "pck_5eqzj6zznasj24mgarqyfm12ek2xgwhymwhbfdft19hqr",
  tokenStore: "cookie",
  redirectMethod: {
    useNavigate,
  }
});