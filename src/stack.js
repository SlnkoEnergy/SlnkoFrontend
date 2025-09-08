import { StackClientApp } from "@stackframe/react";

export const stackClientApp = new StackClientApp({
  projectId: process.env.REACT_APP_STACK_PROJECT_ID,
  publishableClientKey: process.env.REACT_APP_STACK_PUBLISHABLE_KEY,
  tokenStore: "cookie",
  redirectUrl: process.env.REACT_APP_STACK_REDIRECT_URL,
  postLogoutRedirectUrl: process.env.REACT_APP_STACK_POST_LOGOUT_REDIRECT,
});
