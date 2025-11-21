import { useState } from "react";
import api from "../config/axios";
import { useUser } from "../context/UserContext";

export default function Settings() {
  const { user, setUser } = useUser();

  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email,
  });

  const [avatar, setAvatar] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("firstName", form.firstName);
      fd.append("lastName", form.lastName);
      fd.append("phone", form.phone);
      fd.append("email", form.email);
      if (avatar) fd.append("avatar", avatar);

      const res = await api.post("/user/update", fd, {
        withCredentials: true,
      });

      setUser(res.data.user);
      setSuccess("Данные успешно обновлены!");
      setError("");
    } catch (err) {
      setError("Ошибка обновления");
      setSuccess("");
    }
  };

  const handlePasswordChange = async () => {
    if (!form.oldPassword || !form.newPassword) {
      setPasswordError("Введите старый и новый пароль");
      return;
    }

    setLoadingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const res = await api.post(
        "/auth/update-password",
        { oldPassword: form.oldPassword, newPassword: form.newPassword },
        { withCredentials: true }
      );
      setPasswordSuccess("Пароль успешно обновлён!");
      setForm({ ...form, oldPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Ошибка сервера");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <main>
      <div className="container mt-4 pt-4" style={{ maxWidth: "600px" }}>
        <h2>Профиль</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Имя</label>
            <input
              type="text"
              name="firstName"
              className="form-control"
              value={form.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Фамилия</label>
            <input
              type="text"
              name="lastName"
              className="form-control"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Телефон</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="mt-4">
            <h4>Смена пароля</h4>
            <div className="mb-3">
              <label htmlFor="oldPassword" className="form-label">
                Старый пароль
              </label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                className="form-control"
                value={form.oldPassword || ""}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                Новый пароль
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="form-control"
                value={form.newPassword || ""}
                onChange={handleChange}
              />
            </div>

            <button
              type="button"
              className="btn btn-warning"
              onClick={handlePasswordChange}
              disabled={loadingPassword}
            >
              {loadingPassword ? "Сохраняем..." : "Сменить пароль"}
            </button>

            {passwordError && (
              <div className="text-danger mt-2">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="text-success mt-2">{passwordSuccess}</div>
            )}
          </div>
          {success && <p className="text-success">{success}</p>}
          {error && <p className="text-danger">{error}</p>}
          <button className="btn btn-primary w-100">Сохранить</button>
        </form>
      </div>
    </main>
  );
}
