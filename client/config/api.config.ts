import axios from "axios";

axios.defaults.withCredentials = true;
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
});
