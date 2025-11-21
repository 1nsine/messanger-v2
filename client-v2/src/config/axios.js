import axios from "axios";

const api = axios.create({
  baseURL: "https://192.168.0.165:5000",
  withCredentials: true,
});

export default api;
