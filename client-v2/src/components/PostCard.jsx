import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEyeSlash,
  faHeart as faHeartSolid,
  faUserSlash,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { faPen, faTrash, faFlag } from "@fortawesome/free-solid-svg-icons";
import api from "../config/axios";
import ModalEditPost from "./ModalEditPost";
import { useUser } from "../context/UserContext";
import { timeAgo } from "../utils/timeAgo";

export default function PostCard({ post, onDeleted, onUpdated }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [text, setText] = useState(post.text);
  const [liked, setLiked] = useState(post.liked_by_me === 1);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const { user } = useUser();

  const avatarUrl = post.avatar
    ? `https://192.168.0.165:5000${post.avatar}`
    : "/uploads/avatars/default.png";
  const imageUrl = post.image
    ? `https://192.168.0.165:5000${post.image}`
    : null;

  const handleLike = async () => {
    if (!user) return;

    try {
      const res = await api.post("/likes", { post_id: post.id });
      setLiked(res.data.liked);
      setLikeCount(res.data.likes_count);
    } catch (err) {
      console.error("Ошибка при лайке:", err);
      if (err.response?.status === 401)
        alert("Войдите в аккаунт, чтобы лайкать посты");
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (!window.confirm("Вы точно хотите удалить этот пост?")) return;

    try {
      const res = await api.delete(`/posts/delete/${post.id}`);
      if (res.data.success && onDeleted) onDeleted(post.id);
    } catch (err) {
      console.error("Ошибка при удалении поста:", err);
    }
  };

  const handleUpdated = (updatedPost) => {
    setText(updatedPost.text);
    if (onUpdated) onUpdated(updatedPost);
  };

  const isOwnPost = user && user.id === post.user_id;

  return (
    <div className="card mb-3 shadow-sm" style={{ minWidth: "100%" }}>
      {/* Header */}
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="d-flex gap-3 align-items-center">
          <Link to={`/user/${post.username}`} className="sidebar-link">
            <img
              src={avatarUrl}
              alt="avatar"
              className="rounded-circle"
              width="36"
              height="36"
            />
          </Link>

          <Link to={`/user/${post.username}`} className="sidebar-link">
            {post.firstName} {post.lastName}
          </Link>
        </div>

        {user && (
          <div className="dropdown">
            <button
              className="btn"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <strong>. . .</strong>
            </button>

            <ul className="dropdown-menu dropdown-menu-dark">
              {isOwnPost ? (
                <>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => setIsEditOpen(true)}
                    >
                      <FontAwesomeIcon icon={faPen} /> Редактировать запись
                    </button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleDelete}>
                      <FontAwesomeIcon icon={faTrash} /> Удалить запись
                    </button>
                  </li>
                </>
              ) : (
                <>
                  {user.role === "admin" && (
                    <li>
                      <button className="dropdown-item" onClick={handleDelete}>
                        <FontAwesomeIcon icon={faTrash} /> Удалить запись
                      </button>
                    </li>
                  )}
                  <li>
                    <button className="dropdown-item">
                      <FontAwesomeIcon icon={faUserSlash} /> Не интересен автор
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item">
                      <FontAwesomeIcon icon={faEyeSlash} /> Не показывать запись
                    </button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item">
                      <FontAwesomeIcon icon={faFlag} /> Пожаловаться
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="card-body">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="post"
            className="img-fluid rounded"
            style={{ minWidth: "100%" }}
          />
        )}
        <p className="mt-2">{text}</p>
      </div>

      {/* Footer */}
      <div className="card-footer bg-transparent d-flex justify-content-between align-items-center">
        <button
          className="p-2 btn"
          onClick={handleLike}
          disabled={!user}
          style={{
            outline: "none",
            boxShadow: "none",
            cursor: user ? "pointer" : "not-allowed",
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <FontAwesomeIcon
            icon={liked ? faHeartSolid : faHeartRegular}
            style={{
              transition: "transform 0.2s",
              transform: liked ? "scale(1.1)" : "scale(1)",
              color: liked ? "red" : "inherit",
            }}
          />
          <span className="ms-2">{likeCount}</span>
        </button>

        <span>{timeAgo(post.created_at)}</span>
      </div>

      {/* Modal редактирования */}
      <ModalEditPost
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        post={post}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
