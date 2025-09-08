import axios from "axios";
import { stackClientApp } from "../stack";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const token = await stackClientApp.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
