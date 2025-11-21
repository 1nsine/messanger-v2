import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useUser } from "./context/UserContext.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Settings from "./pages/Settings.jsx";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { hideElements } from "./config/routerConfig";

export default function App() {
  const { user, loadingUser } = useUser();
  const isAuthenticated = !!user;
  const location = useLocation();

  const hideLayout = hideElements.some((path) =>
    location.pathname.startsWith(path)
  );

  if (loadingUser) return <p>Загрузка...</p>;

  return (
    <>
      {!hideLayout && <Sidebar />}
      {!hideLayout && <Header />}

      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Home /> : <Navigate to="/auth/login" replace />
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <Settings />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="/auth/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/auth/register"
          element={
            !isAuthenticated ? <Register /> : <Navigate to="/" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
