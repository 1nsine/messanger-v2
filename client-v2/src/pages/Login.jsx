import React, { useState, useEffect } from "react";
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
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [visible, setVisible] = useState(false);

  const navigate = useNavigate();
  const { login, user } = useUser();

  // Редирект если пользователь уже авторизован
  useEffect(() => {
    if (user) {
      console.log("Пользователь авторизован, редирект на главную");
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

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
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const toggleVisibility = () => setVisible(!visible);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.login.trim() || !formData.password.trim()) {
      setMessage({
        type: "error",
        text: "Пожалуйста, заполните все поля",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      console.log("Отправка данных авторизации...");

      const response = await api.post("/auth/login", formData, {
        withCredentials: true,
      });

      console.log("Успешный ответ от сервера:", response.data);

      if (response.data.user) {
        // Обновляем контекст пользователя
        console.log("Обновление контекста пользователя...");
        await login(response.data.user);

        console.log("Контекст обновлен, пользователь:", response.data.user);

        setMessage({
          type: "success",
          text: "Успешный вход! Перенаправляем...",
        });

        // Не делаем сразу редирект - он произойдет автоматически через useEffect
        // когда user в контексте обновится
      } else {
        throw new Error("Неверный ответ от сервера");
      }
    } catch (error) {
      console.error("Ошибка авторизации:", error);

      let errorMessage = "Ошибка авторизации";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Неверный логин или пароль";
        } else if (error.response.status === 400) {
          errorMessage = "Неверный формат данных";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Сервер не отвечает";
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.login.trim() && formData.password.trim();

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form className="form-login" onSubmit={handleSubmit}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn d-flex align-items-center p-absolute mb-3"
          style={{ gap: "0.5rem" }}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <h2 className="h2 mb-3 text-center">Авторизация</h2>

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
            value={formData.login}
            onChange={handleFormChange}
            disabled={loading}
          />
        </div>

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
            value={formData.password}
            onChange={handleFormChange}
            disabled={loading}
          />
          <button
            type="button"
            onClick={toggleVisibility}
            className="btn btn-eye"
            onMouseDown={(e) => e.preventDefault()}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              padding: 0,
              outline: "none",
              boxShadow: "none",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} />
          </button>
        </div>

        <div className="d-flex justify-content-around mb-3">
          <Link
            to={loading ? "#" : "/auth/forgot-password"}
            className="form-text underline-center"
            style={{
              pointerEvents: loading ? "none" : "auto",
              opacity: loading ? 0.6 : 1,
              textDecoration: "none",
            }}
            onClick={(e) => loading && e.preventDefault()}
          >
            Забыли пароль?
          </Link>
          <Link
            to={loading ? "#" : "/auth/register"}
            className="form-text underline-center"
            style={{
              pointerEvents: loading ? "none" : "auto",
              opacity: loading ? 0.6 : 1,
              textDecoration: "none",
            }}
            onClick={(e) => loading && e.preventDefault()}
          >
            Нет аккаунта?
          </Link>
        </div>

        <div
          style={{
            minHeight: "3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
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
              transition: "opacity 0.3s ease-in-out",
              fontWeight: "500",
            }}
          >
            {message.text || " "}
          </p>
        </div>

        <button
          className="btn btn-login w-100"
          disabled={loading || !isFormValid}
          style={{
            cursor: loading || !isFormValid ? "not-allowed" : "pointer",
            opacity: loading || !isFormValid ? 0.6 : 1,
          }}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Выполняется вход...
            </>
          ) : (
            "Войти"
          )}
        </button>
      </form>
    </div>
  );
}
