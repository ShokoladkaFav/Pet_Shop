
import React, { useState, useEffect } from "react";
import "./Auth.css";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [csrfToken, setCsrfToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost/zoo-api/get_csrf.php")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrf_token))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Валідація на стороні клієнта
    if (!username.trim() || !email.trim() || !password.trim()) {
      setMessage("⚠️ Будь ласка, заповніть усі поля.");
      return;
    }

    if (password.length < 6) {
      setMessage("⚠️ Пароль має бути не менше 6 символів.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("⚠️ Введіть коректний Email (наприклад: user@mail.com).");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost/zoo-api/register_user.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, csrf_token: csrfToken }),
      });

      // Читаємо відповідь як текст, щоб уникнути помилок, якщо заголовок Content-Type відсутній
      const text = await response.text();
      let result;

      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error("JSON Parse Error. Server sent:", text);
        throw new Error("Сервер повернув не коректні дані (не JSON).");
      }

      if (result.status === "success") {
        setMessage("✅ Реєстрація успішна! Переходимо на сторінку входу...");
        // Очищаємо поля
        setUsername("");
        setEmail("");
        setPassword("");
        
        // Перенаправлення через 2 секунди
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setMessage(`❌ ${result.message || "Помилка реєстрації."}`);
      }
    } catch (error: any) {
      console.error("Register Error:", error);
      if (error.message.includes("Failed to fetch")) {
        setMessage("❌ Немає зв'язку з сервером. Перевірте API.");
      } else {
        setMessage(`❌ Помилка: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Реєстрація користувача</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ім'я користувача (Логін)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          
          <div className="password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль (мін. 6 символів)"
              value={password}
              className="password-input"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              title={showPassword ? "Приховати" : "Показати"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Реєстрація..." : "Зареєструватися"}
          </button>
        </form>
        
        {message && (
          <p className="auth-text" style={{ fontWeight: "bold", color: message.startsWith("✅") ? "green" : message.startsWith("⚠️") ? "#e65100" : "red" }}>
            {message}
          </p>
        )}
        
        <p className="auth-text">
          Вже маєте акаунт?{" "}
          <a href="/login" className="auth-link">
            Увійти
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
