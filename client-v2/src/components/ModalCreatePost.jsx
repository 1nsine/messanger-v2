import { useState, useRef, useEffect } from "react";
import ModalBase from "./ModalBase";
import api from "../config/axios";

export default function ModalCreatePost({
  isOpen,
  onClose,
  onCreated,
  socket,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef(null);
  const MAX_CHARS = 500;

  const handleDeleteImage = () => {
    setPreview(null);
    setFile(null);
  };

  // Автоподстройка textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [text]);

  // Очистка формы при закрытии
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreview(null);
      setText("");
      setProgress(0);
      setError("");
      setSuccess("");
      setIsDragging(false);
    }
  }, [isOpen]);

  // Обработка выбора файла
  const handleFile = (e) => {
    const f = e.target.files[0];
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
    setError("");
  };

  // Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
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
    setError("");
  };

  // Отправка поста
  const submit = async () => {
    setError("");
    setSuccess("");
    setProgress(0);

    if (text.trim().length < 3) {
      setError("Текст поста должен быть не меньше 3 символов");
      return;
    }
    if (text.length > MAX_CHARS) {
      setError(`Текст поста не должен превышать ${MAX_CHARS} символов`);
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("text", text);

    try {
      const res = await api.post("/posts/create", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
      });

      setSuccess("Пост успешно создан!");
      const newPost = res.data.post;

      if (onCreated) onCreated(newPost);
      if (socket) socket.emit("newPostCreated", newPost);

      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setText("");
        setProgress(0);
        setError("");
        setSuccess("");
        onClose();
      }, 800);
    } catch (err) {
      setError("Ошибка отправки на сервер");
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
        <h5 className="mb-3 text-center">Создать новый пост</h5>

        {/* Drag & Drop */}
        <div
          className={`d-flex justify-content-center align-items-center border rounded position-relative ${
            isDragging ? "bg-light" : ""
          }`}
          style={{
            borderStyle: "dashed",
            cursor: "pointer",
            flex: 1, // занимает все доступное место
            overflow: "hidden",
            minHeight: "200px",
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput").click()}
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
            id="fileInput"
            type="file"
            accept="image/*"
            className="d-none"
            onChange={handleFile}
          />
        </div>

        {/* TEXTAREA */}
        <div className="mb-2 mt-2">
          <textarea
            ref={textareaRef}
            className={`form-control ${error ? "is-invalid" : ""}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите текст поста..."
            style={{
              overflow: "hidden",
              resize: "none",
              transition: "height 0.2s ease",
            }}
          />
          <div className="text-end small text-muted">
            {text.length} / {MAX_CHARS}
          </div>
          {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>

        {/* PROGRESS BAR */}
        {progress > 0 && progress < 100 && (
          <div className="mb-3">
            <div className="progress">
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {progress}%
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {success && <div className="alert alert-success">{success}</div>}

        {/* BUTTONS */}
        <div className="d-flex justify-content-end mt-2">
          <button className="btn btn-secondary me-2" onClick={onClose}>
            Отмена
          </button>
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={text.trim().length < 3 || text.length > MAX_CHARS}
          >
            Создать пост
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
