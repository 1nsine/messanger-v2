import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import api from "../config/axios";
import "./css/Login.css";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    phone: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  console.log(form);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true); // чекбокс
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setDisabled(!e.target.checked);
  };

  const toggleVisibility = () => setVisible(!visible);

  // Валидация на каждом шаге
  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!form.phone) {
        setError("Пожалуйста, введите номер телефона.");
        return false;
      }
    } else if (step === 2) {
      if (!form.firstName || !form.lastName) {
        setError("Пожалуйста, введите имя и фамилию.");
        return false;
      }
    } else if (step === 3) {
      if (!form.email) {
        setError("Пожалуйста, введите email.");
        return false;
      }
    } else if (step === 4) {
      if (!form.password) {
        setError("Пожалуйста, введите пароль.");
        return false;
      }
      if (disabled) {
        setError("Вы должны согласиться с политикой конфиденциальности.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const prevStep = () => {
    setStep((s) => s - 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", form);
      setSuccess(res.data.message);
      setForm({
        phone: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        avatar: null,
      });
      setStep(1);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  // Добавляем функцию форматирования внутри компонента
  const formatPhoneNumber = (value) => {
    // Убираем все нецифровые символы
    const digits = value.replace(/\D/g, "");

    if (!digits) return "";

    // Берем первые 11 цифр (если больше — обрезаем)
    const trimmed = digits.slice(0, 11);

    const country = trimmed.slice(0, 1) || "";
    const area = trimmed.slice(1, 4) || "";
    const firstPart = trimmed.slice(4, 7) || "";
    const secondPart = trimmed.slice(7, 9) || "";
    const thirdPart = trimmed.slice(9, 11) || "";

    let formatted = `+${country}`;
    if (area) formatted += ` (${area})`;
    if (firstPart) formatted += `-${firstPart}`;
    if (secondPart) formatted += `-${secondPart}`;
    if (thirdPart) formatted += `-${thirdPart}`;

    return formatted;
  };

  // Изменяем handleFormChange для телефона
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "phone") {
      value = formatPhoneNumber(value); // форматируем номер на лету
    }

    setForm({ ...form, [name]: value });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form className="form-login" onSubmit={handleSubmit}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn d-flex align-items-center mb-3"
          style={{ gap: "0.5rem" }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <h2 className="h2 mb-3 text-center">Создание аккаунта</h2>

        {/* Ошибка */}
        {error && <div className="text-danger mb-3 text-center">{error}</div>}

        {/* Шаг 1: Номер телефона */}
        {step === 1 && (
          <div className="mb-3 column-gap-3">
            <label className="form-label" htmlFor="phone">
              Номер телефона
            </label>
            <input
              type="text"
              className="form-control"
              name="phone"
              value={form.phone}
              onChange={handleChange} // теперь с форматированием
              placeholder="+7 (999)-999-99-99"
              id="phone"
            />
            <div className="d-flex justify-content-end mt-3">
              <button
                type="button"
                className="btn btn-login"
                onClick={nextStep}
              >
                Далее
              </button>
            </div>
          </div>
        )}

        {/* Шаг 2: Имя и Фамилия */}
        {step === 2 && (
          <>
            <div className="mb-3">
              <label className="form-label" htmlFor="firstName">
                Имя
              </label>
              <input
                type="text"
                className="form-control"
                name="firstName"
                value={form.firstName}
                onChange={handleFormChange}
                placeholder="Введите имя"
                id="firstName"
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="lastName">
                Фамилия
              </label>
              <input
                type="text"
                className="form-control"
                name="lastName"
                value={form.lastName}
                onChange={handleFormChange}
                placeholder="Введите фамилию"
                id="lastName"
              />
            </div>
            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-login"
                onClick={prevStep}
              >
                Назад
              </button>
              <button
                type="button"
                className="btn btn-login"
                onClick={nextStep}
              >
                Далее
              </button>
            </div>
          </>
        )}

        {/* Шаг 3: Email */}
        {step === 3 && (
          <>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">
                Электронная почта
              </label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                placeholder="Введите email"
                id="email"
              />
            </div>
            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-login"
                onClick={prevStep}
              >
                Назад
              </button>
              <button
                type="button"
                className="btn btn-login"
                onClick={nextStep}
              >
                Далее
              </button>
            </div>
          </>
        )}

        {/* Шаг 4: Пароль + чекбокс + отправка */}
        {step === 4 && (
          <>
            <div className="mb-3 password">
              <label htmlFor="password" className="form-label">
                Придумайте пароль
              </label>
              <input
                type={visible ? "text" : "password"}
                className="form-control"
                id="password"
                name="password"
                value={form.password}
                onChange={handleFormChange}
                placeholder="Пароль"
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

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="policyCheck"
                checked={!disabled}
                onChange={handleCheckboxChange}
              />
              <label className="form-check-label" htmlFor="policyCheck">
                Я согласен с <Link to="/faq">политикой конфиденциальности</Link>
              </label>
            </div>

            <div style={{ minHeight: "1.5rem" }}>
              <p
                className={`text-center mb-0 ${success ? "text-success" : ""}`}
                style={{ opacity: success ? 1 : 0, transition: "opacity 0.5s" }}
              >
                {success || " "}
              </p>
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-login"
                onClick={prevStep}
              >
                Назад
              </button>
              <button className="btn btn-login" disabled={disabled || loading}>
                {loading ? "Регистрация..." : "Создать аккаунт"}
              </button>
            </div>
          </>
        )}

        <p className="text-center mt-3">
          Уже есть аккаунт?{" "}
          <Link to="/auth/login" className="form-text underline-center">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}
