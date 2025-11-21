import { createContext, useContext, useState, useEffect } from "react";
import api from "../config/axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me", { withCredentials: true })
      .then((res) => setUser(res.data.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
