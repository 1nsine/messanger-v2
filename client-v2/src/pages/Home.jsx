import { useState, useEffect, lazy, Suspense } from "react";

import api from "../config/axios";
const Postcard = lazy(() => import("../components/Postcard"));

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
          <Suspense fallback={<div>Загрузка постов...</div>}>
            {posts.map((post) => (
              <Postcard key={post.id} post={post} />
            ))}
          </Suspense>
        </div>
      )}
    </main>
  );
}
