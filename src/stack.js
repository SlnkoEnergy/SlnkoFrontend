import { StackClientApp } from "@stackframe/react";
import { useNavigate } from "react-router-dom";

export const stackClientApp = new StackClientApp({
  projectId: process.env.REACT_APP_STACK_PROJECT_ID,
  publishableClientKey: process.env.REACT_APP_STACK_PUBLISHABLE_KEY,
  tokenStore: "cookie",
  redirectMethod: { useNavigate },
  // Use Stack's built-in handler pages
  urls: {
    handler: "/handler",
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up",
    afterSignIn: "/dashboard", // adjust if needed
    afterSignUp: "/dashboard",
  },
});
