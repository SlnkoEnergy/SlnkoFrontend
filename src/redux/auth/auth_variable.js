// export const BASE_URL = "${process.env.REACT_APP_API_URL}/";

import { fetchBaseQuery } from "@reduxjs/toolkit/query";

// export const getAuthToken = () => {
//   return localStorage.getItem("authToken");
// };

export const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}/`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("authToken");
    // console.log(token);
    if (token) {
      headers.set("x-auth-token", token);
    }
    return headers;
  },
});
