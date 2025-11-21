import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios"; // настроенный axios с HTTPS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import "./css/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ login: "", password: "" });
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleVisibility = () => setVisible(!visible);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("/auth/login", {
        email: form.login, // если у тебя поддерживается и телефон, backend нужно будет адаптировать
        password: form.password,
      });

      setSuccess("Успешный вход!");
      setTimeout(() => {
        navigate("/"); // редирект на главную
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form className="form-login p-4 shadow rounded" onSubmit={handleSubmit}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn d-flex align-items-center mb-3"
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
            required
          />
        </div>

        {/* Поле пароль */}
        <div className="mb-3 position-relative">
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
            required
          />
          <button
            type="button"
            onClick={toggleVisibility}
            className="btn btn-eye position-absolute top-50 end-0 translate-middle-y me-2"
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
        <div className="d-flex justify-content-between mb-3">
          <Link to="/auth/forgot-password" className="form-text">
            Забыли пароль?
          </Link>
          <Link to="/auth/register" className="form-text">
            Нет аккаунта?
          </Link>
        </div>

        {/* Ошибки / успех */}
        <div style={{ minHeight: "1.5rem" }}>
          <p
            className={`text-center mb-0 ${
              error ? "text-danger" : success ? "text-success" : ""
            }`}
            style={{
              opacity: error || success ? 1 : 0,
              transition: "opacity 0.5s",
            }}
          >
            {error || success || " "}
          </p>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Выполняется вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
