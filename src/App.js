import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Index from "./routes/index";

export default function App() {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <Index />
    </div>
  );
}
