import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me", { withCredentials: true });
      setUser(res.data.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // Функция для авторизации с гарантированным обновлением
  const login = async (userData) => {
    return new Promise((resolve) => {
      setUser(userData);
      setLoadingUser(false);

      // Гарантируем, что состояние обновилось перед редиректом
      setTimeout(() => {
        resolve();
      }, 100);
    });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    loadingUser,
    login,
    logout,
    fetchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
