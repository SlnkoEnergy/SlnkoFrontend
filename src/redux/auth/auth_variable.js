// export const BASE_URL = "https://api.slnkoprotrac.com/v1/";

import { fetchBaseQuery } from "@reduxjs/toolkit/query";

// export const getAuthToken = () => {
//   return localStorage.getItem("authToken");
// };

export const baseQuery = fetchBaseQuery({
  baseUrl: "https://api.slnkoprotrac.com/v1/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
console.log(token);
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
 
  },
});
