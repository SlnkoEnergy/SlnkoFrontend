export const BASE_URL = "https://api.slnkoprotrac.com/v1/";

export const getAuthToken = () => {
  return sessionStorage.getItem("authToken");
};
