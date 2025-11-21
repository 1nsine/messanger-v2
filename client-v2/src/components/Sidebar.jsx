import { lazy, Suspense, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./css/Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlus,
  faMessage,
  faHome,
  faBell,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import api from "../config/axios";

const ModalCreatePost = lazy(() => import("../components/ModalCreatePost.jsx"));
import Spinner from "../components/Spinner.jsx";
import { useUser } from "../context/UserContext";

export default function Sidebar() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const [requestCount, setRequestCount] = useState(0);

  // 🔹 Функция получения количества входящих заявок
  // const fetchPendingRequests = async () => {
  //   if (!user) return;
  //   try {
  //     const res = await api.get(`/friends/requests/count`);
  //     setRequestCount(res.data.count || 0);
  //   } catch (err) {
  //     console.error("Ошибка получения количества заявок:", err);
  //   }
  // };

  // // 🔹 Поллинг: каждые 5 секунд обновляем количество заявок
  // useEffect(() => {
  //   fetchPendingRequests();
  //   const interval = setInterval(fetchPendingRequests, 5000);
  //   return () => clearInterval(interval);
  // }, [user]);

  // 🔹 Поиск пользователей
  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(value)}`);
      const list = Array.isArray(res.data.users) ? res.data.users : res.data;
      setUsers(list);
    } catch (err) {
      console.error("Ошибка поиска:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="sidebar fixed-top bg-body-tertiary">
      <input
        type="text"
        role="search"
        placeholder="Поиск"
        value={query}
        onChange={handleSearch}
        className="form-control mb-2"
      />

      {loading && <div className="small text-muted ms-1">Загрузка...</div>}

      {users.length > 0 && (
        <div className="search-results mb-2">
          {users.map((u) => (
            <Link
              key={u.id}
              to={`/user/${u.username}`}
              className="list-group-item list-group-item-action gap-1 d-flex"
            >
              <img
                src={`https://192.168.0.165:5000${u.avatar}`}
                alt=""
                width={40}
                height={40}
                className="rounded-circle"
              />
              <div className="container">
                <h6>
                  {u.firstName} {u.lastName}
                </h6>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="container ps-4">
        {user && (
          <button
            className="btn btn-post d-flex flex-row align-items-center p-2 pe-3 mb-2"
            onClick={() => setOpen(true)}
          >
            <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
            Опубликовать
          </button>
        )}

        <Link
          to="/"
          className="mt-2 gap-2 d-flex align-items-center justify-content-start sidebar-link underline-center"
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Главная</span>
        </Link>

        {user && (
          <>
            <Link
              to="/message"
              className="mt-2 gap-2 d-flex align-items-center justify-content-start sidebar-link underline-center"
            >
              <FontAwesomeIcon icon={faMessage} />
              <span>Сообщения</span>
            </Link>

            <Link
              to="/notifications"
              className="mt-2 gap-2 d-flex align-items-center justify-content-start sidebar-link underline-center"
            >
              <FontAwesomeIcon icon={faBell} />
              <span>Уведомления</span>
            </Link>

            <Link
              to="/friends"
              className="mt-2 gap-2 d-flex align-items-center justify-content-start sidebar-link underline-center"
            >
              <FontAwesomeIcon icon={faUserGroup} />
              <span>Друзья</span>
              {requestCount > 0 && (
                <span className="badge bg-primary ms-2">{requestCount}</span>
              )}
            </Link>
          </>
        )}
      </div>

      <Suspense
        fallback={
          <main className="d-flex justify-content-center align-items-center vh-100">
            <Spinner />
          </main>
        }
      >
        {user && (
          <ModalCreatePost isOpen={open} onClose={() => setOpen(false)} />
        )}
      </Suspense>
    </aside>
  );
}
