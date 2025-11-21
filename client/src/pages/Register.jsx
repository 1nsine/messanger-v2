import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    // сюда можно добавить маску для телефона
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleVisibility = () => setVisible(!visible);

  const handleCheckboxChange = () => setDisabled(!disabled);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 4) return; // Отправка только на последнем шаге

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("/auth/register", {
        username: form.phone, // Можно заменить на любое уникальное поле
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      });

      setSuccess("Аккаунт создан!");
      setTimeout(() => navigate("/auth/login"), 1000);
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
          <FontAwesomeIcon icon={faArrowLeft} /> Назад
        </button>

        <h2 className="h2 mb-3 text-center">Создание аккаунта</h2>

        {error && <div className="text-danger mb-3 text-center">{error}</div>}

        {/* Шаг 1: Номер телефона */}
        {step === 1 && (
          <div className="mb-3">
            <label className="form-label" htmlFor="phone">
              Номер телефона
            </label>
            <input
              type="text"
              className="form-control"
              name="phone"
              value={form.phone}
              onChange={handleChange}
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
            <div className="mb-3 password position-relative">
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
                className="btn btn-eye position-absolute top-50 end-0 translate-middle-y me-2"
                onMouseDown={(e) => e.preventDefault()}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  outline: "none",
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
              <button
                type="submit"
                className="btn btn-login"
                disabled={disabled || loading}
              >
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
