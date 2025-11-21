import { useState, useRef, useEffect } from "react";
import api from "../config/axios";
import ModalBase from "./ModalBase";

export default function ModalEditPost({ isOpen, onClose, post, onUpdated }) {
  const [editedText, setEditedText] = useState(post.text || "");
  const [error, setError] = useState("");

  // Фото
  const [file, setFile] = useState(null); // новый выбранный файл
  const [preview, setPreview] = useState(
    post.image ? `https://192.168.0.165:5000${post.image}` : null
  );
  const [deleteImage, setDeleteImage] = useState(false);

  // Drag & Drop
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const MAX_CHARS = 500;

  // Автоподстройка textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [editedText]);

  // Сброс при закрытии
  useEffect(() => {
    if (!isOpen) {
      setEditedText(post.text || "");
      setPreview(post.image ? `https://192.168.0.165:5000${post.image}` : null);
      setFile(null);
      setDeleteImage(false);
      setError("");
      setIsDragging(false);
    }
  }, [isOpen, post]);

  const validate = (text) => {
    if (text.trim().length < 3) {
      setError("Текст должен быть не меньше 3 символов");
      return false;
    } else if (text.length > MAX_CHARS) {
      setError(`Максимум ${MAX_CHARS} символов`);
      return false;
    }
    setError("");
    return true;
  };

  const handleChange = (e) => {
    setEditedText(e.target.value);
    validate(e.target.value);
  };

  const handleDeleteImage = () => {
    setPreview(null);
    setFile(null);
    setDeleteImage(true);
  };

  const handleFileSelect = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Можно загружать только изображения");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Максимальный размер изображения 5 МБ");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setDeleteImage(false);
    setError("");
  };

  const saveChanges = async () => {
    if (!validate(editedText)) return;

    try {
      const form = new FormData();
      form.append("text", editedText);
      form.append("deleteImage", deleteImage ? "1" : "0");
      if (file) form.append("image", file);

      const res = await api.put(`/posts/update/${post.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        onUpdated({
          ...post,
          text: editedText,
          image: deleteImage ? null : res.data.image || post.image,
        });
        onClose();
      } else {
        setError("Ошибка при сохранении поста");
      }
    } catch (err) {
      console.error(err);
      setError("Ошибка при сохранении поста");
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div
        className="p-3 d-flex flex-column"
        style={{
          minWidth: "350px",
          maxWidth: "600px",
          height: "70vh", // фиксированная высота
        }}
      >
        <h4 className="text-center mb-3">Редактировать пост</h4>

        {/* Drag & Drop / Превью */}
        <div
          className={`d-flex justify-content-center align-items-center border rounded position-relative ${
            isDragging ? "bg-light" : ""
          }`}
          style={{
            borderStyle: "dashed",
            cursor: "pointer",
            flex: 1,
            overflow: "hidden",
            minHeight: "200px",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current.click()}
        >
          {preview ? (
            <div className="position-relative w-100 h-100">
              <img
                src={preview}
                alt="preview"
                className="position-absolute top-0 start-0 w-100 h-100 rounded"
                style={{ objectFit: "contain" }}
              />
              <button
                type="button"
                className="btn-close position-absolute"
                style={{
                  top: "8px",
                  right: "8px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  padding: "6px",
                  zIndex: 10,
                }}
                onClick={handleDeleteImage}
              ></button>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-1">Перетащите изображение сюда</p>
              <p className="text-muted small">или нажмите, чтобы выбрать</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept="image/*"
            className="d-none"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
        </div>

        {/* Текст */}
        <textarea
          ref={textareaRef}
          className={`form-control mt-2 ${error ? "is-invalid" : ""}`}
          value={editedText}
          onChange={handleChange}
          placeholder="Введите текст..."
          style={{
            overflow: "hidden",
            resize: "none",
            transition: "height 0.2s ease",
          }}
        />
        {error && <div className="invalid-feedback">{error}</div>}

        {/* Кнопка */}
        <div className="d-flex justify-content-end mt-3">
          <button
            className="btn btn-primary"
            onClick={saveChanges}
            disabled={editedText.trim().length < 3}
          >
            Сохранить
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
