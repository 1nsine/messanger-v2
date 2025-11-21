import { useState, useEffect } from "react";
import api from "../config/axios";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Пока просто заглушка, позже будем получать посты с сервера
    api
      .get("/posts", { withCredentials: true })
      .then((res) => setPosts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <h2 className="mb-4">Главная</h2>

      {/* Заглушка для постов */}
      {loading ? (
        <p>Загрузка...</p>
      ) : posts.length === 0 ? (
        <p>Постов пока нет</p>
      ) : (
        <div className="row g-3">
          {posts.map((post) => (
            <div key={post.id} className="col-12 col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{post.username}</h5>
                  <p className="card-text">{post.text}</p>
                  <small className="text-muted">
                    {new Date(post.created_at).toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
