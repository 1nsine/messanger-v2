import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import api from "../config/axios";
import { useUser } from "../context/UserContext";
import "./css/Login.css";

export default function Login() {
  const [form, setForm] = useState({ login: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [visible, setVisible] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useUser();

  // Форматируем номер телефона
  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    const trimmed = digits.slice(0, 11);
    const country = trimmed.slice(0, 1);
    const area = trimmed.slice(1, 4);
    const firstPart = trimmed.slice(4, 7);
    const secondPart = trimmed.slice(7, 9);
    const thirdPart = trimmed.slice(9, 11);

    let formatted = `+${country}`;
    if (area) formatted += ` (${area})`;
    if (firstPart) formatted += `-${firstPart}`;
    if (secondPart) formatted += `-${secondPart}`;
    if (thirdPart) formatted += `-${thirdPart}`;

    return formatted;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const formattedValue =
      name === "login" && /^[\d+]/.test(value)
        ? formatPhoneNumber(value)
        : value;
    setForm((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const toggleVisibility = () => setVisible(!visible);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.post("/auth/login", form, {
        withCredentials: true,
      });

      // Обновляем глобальный контекст пользователя
      setUser(res.data.user);

      setMessage({
        type: "success",
        text: res.data.message || "Вход выполнен!",
      });
      setForm({ login: "", password: "" });

      // Перенаправляем
      navigate(res.data.redirect, {
        replace: true,
        state: { reload: Date.now() },
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Ошибка входа",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form className="form-login" onSubmit={handleSubmit}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn d-flex align-items-center p-absolute mb-3"
          style={{ gap: "0.5rem" }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <h2 className="h2 mb-3 text-center">Авторизация</h2>

        {/* Поле login */}
        <div className="mb-3">
          <label htmlFor="login" className="form-label">
            Email или номер телефона
          </label>
          <input
            type="text"
            className="form-control"
            id="login"
            placeholder="Введите email или телефон"
            name="login"
            value={form.login}
            onChange={handleFormChange}
          />
        </div>

        {/* Поле пароль */}
        <div className="mb-3 password">
          <label htmlFor="password" className="form-label">
            Пароль
          </label>
          <input
            type={visible ? "text" : "password"}
            className="form-control"
            id="password"
            placeholder="Пароль"
            name="password"
            value={form.password}
            onChange={handleFormChange}
          />
          <button
            type="button"
            onClick={toggleVisibility}
            className="btn btn-eye"
            onMouseDown={(e) => e.preventDefault()}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              outline: "none",
              boxShadow: "none",
            }}
          >
            <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} />
          </button>
        </div>

        {/* Ссылки */}
        <div className="d-flex justify-content-around mb-3">
          <Link
            to="/auth/forgot-password"
            className="form-text underline-center"
          >
            Забыли пароль?
          </Link>
          <Link to="/auth/register" className="form-text underline-center">
            Нет аккаунта?
          </Link>
        </div>

        {/* Сообщение */}
        <div style={{ minHeight: "1.5rem" }}>
          <p
            className={`text-center mb-0 ${
              message.type === "error"
                ? "text-danger"
                : message.type === "success"
                ? "text-success"
                : ""
            }`}
            style={{
              opacity: message.text ? 1 : 0,
              transition: "opacity 0.5s",
            }}
          >
            {message.text || " "}
          </p>
        </div>

        <button className="btn btn-login" disabled={loading}>
          {loading ? "Выполняется вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
