// src/common/apiClient.js
import axios from "axios";
import { baseURL } from "./SummaryApi";

const apiClient = axios.create({
  baseURL, // automatically prepends http://localhost:8080
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // if your backend uses cookies
});

export default apiClient;
