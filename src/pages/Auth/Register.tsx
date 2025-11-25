import React, { useState, useEffect } from "react";
import "./Auth.css";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost/zoo-api/get_csrf.php")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrf_token))
      .catch(() => setMessage("❌ Не вдалося отримати CSRF токен"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setMessage("⚠️ Заповніть усі поля!");
      return;
    }

    try {
      const response = await fetch("http://localhost/zoo-api/register_user.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, csrf_token: csrfToken }),
      });

      const result = await response.json();

      if (result.status === "success") {
        setMessage("✅ Реєстрація успішна! Тепер можете увійти.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setMessage("❌ Помилка при реєстрації. Спробуйте пізніше.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Реєстрація користувача</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ім'я користувача"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="auth-btn" type="submit">
            Зареєструватися
          </button>
        </form>
        {message && <p className="auth-text">{message}</p>}
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