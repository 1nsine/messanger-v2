import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./css/Header.css";
import api from "../config/axios";
import { useUser } from "../context/UserContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightToBracket,
  faArrowRightFromBracket,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const { user, setUser, loading } = useUser();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");

  // применяем тему при загрузке или изменении
  useEffect(() => {
    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.documentElement.setAttribute(
        "data-bs-theme",
        prefersDark ? "dark" : "light"
      );
    } else {
      document.documentElement.setAttribute("data-bs-theme", theme);
    }
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // уничтожение сессии
  const logout = (setUser) => {
    try {
      api.post("/auth/logout").then(() => {
        setUser(null);
        localStorage.removeItem("user");
      });
    } catch (err) {
      console.error("Ошибка при выходе:", err);
    }
  };

  return (
    <nav className="navbar fixed-top bg-body-tertiary justify-around">
      <div className="container-fluid">
        <Link to="/">Chat</Link>

        {user ? (
          <div className="nav-item dropdown d-flex gap-10">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src={`https://192.168.0.165:5000${user.avatar}`}
                alt="avatar"
                width={38}
                height={38}
                className="rounded-circle me-2"
              />
            </a>
            <ul className="dropdown-menu dropdown-menu-end custom-dropdown">
              <li>
                <div className="d-flex p-3 d-flex flex-column align-items-center">
                  <Link to={`/user/profile`}>
                    <img
                      src={`https://192.168.0.165:5000${user.avatar}`}
                      alt="avatar"
                      width={60}
                      height={60}
                      className="rounded-circle mx-auto"
                    />
                  </Link>
                  <h6 className="mt-3">{user.phone}</h6>
                  <h4 className="pt-3 ">
                    {user.firstName} {user.lastName}
                  </h4>
                </div>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>

              {/* Смена темы */}
              <li className="px-3">
                <h6>Выберите тему</h6>
                <div className="d-flex gap-2 mt-2">
                  <button
                    className={`btn btn-sm ${
                      theme === "light" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => handleThemeChange("light")}
                  >
                    Светлая
                  </button>
                  <button
                    className={`btn btn-sm ${
                      theme === "dark" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => handleThemeChange("dark")}
                  >
                    Тёмная
                  </button>
                  <button
                    className={`btn btn-sm ${
                      theme === "system" ? "btn-primary" : "btn-outline-primary"
                    }`}
                    onClick={() => handleThemeChange("system")}
                  >
                    Системная
                  </button>
                </div>
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <Link
                  to="/user/settings"
                  className="dropdown-item gap-2 d-flex  align-items-center justify-content-start ps-4"
                >
                  <FontAwesomeIcon icon={faUserGear} />
                  <span>Настройки пользователя</span>
                </Link>
              </li>
              <li>
                <a
                  className="dropdown-item gap-2 d-flex  align-items-center justify-content-start ps-4"
                  href="#"
                  onClick={() => logout(setUser)}
                >
                  <FontAwesomeIcon icon={faArrowRightFromBracket} />
                  <span>Выйти</span>
                </a>
              </li>
            </ul>
          </div>
        ) : (
          <Link
            to="/auth/login"
            className="btn btn-primary gap-2 d-flex  align-items-center justify-content-start ps-4"
            type="submit"
          >
            <FontAwesomeIcon icon={faArrowRightToBracket} />
            <span>Авторизация</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
