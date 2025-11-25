import React, { useState, useEffect } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [message, setMessage] = useState("");
  const [isEmployee, setIsEmployee] = useState(false); // 🆕 Чекбокс для працівників
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost/zoo-api/get_csrf.php")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrf_token))
      .catch(() => {
        // Ігноруємо помилку, якщо API недоступне (для локальної розробки без бекенду)
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("⚠️ Заповніть усі поля (Email та Пароль)!");
      return;
    }

    // 🔄 Вибираємо ендпоінт залежно від чекбокса
    const endpoint = isEmployee
      ? "http://localhost/zoo-api/employee_login.php"
      : "http://localhost/zoo-api/login_user.php";

    // 📦 Формуємо дані
    const payload = isEmployee
      ? { work_email: email, password }
      : { email, password, csrf_token: csrfToken };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status === "success") {
        if (isEmployee) {
          // 👨‍💼 Вхід ПРАЦІВНИКА
          sessionStorage.setItem("employee", JSON.stringify(result.employee));
          window.dispatchEvent(new Event("storage"));
          setMessage("✅ Вхід у систему працівника успішний!");
          setTimeout(() => navigate("/worker-dashboard"), 1000);
        } else {
          // 👤 Вхід КЛІЄНТА
          sessionStorage.setItem("user", JSON.stringify(result.user));
          window.dispatchEvent(new Event("storage"));
          setMessage("✅ Вхід успішний! Перенаправлення до акаунту...");
          setTimeout(() => navigate("/account"), 1500);
        }
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Помилка з'єднання з сервером.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Вхід</h2>
        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "15px" }}>
          (Для клієнтів та співробітників)
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={isEmployee ? "Робочий Email" : "Email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* 🆕 Чекбокс для вибору ролі */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
            <input
              type="checkbox"
              id="employeeCheck"
              checked={isEmployee}
              onChange={(e) => setIsEmployee(e.target.checked)}
              style={{ width: "auto", margin: 0 }}
            />
            <label htmlFor="employeeCheck" style={{ color: "#2e7d32", fontWeight: "600", cursor: "pointer" }}>
              Увійти як співробітник
            </label>
          </div>

          <button className="auth-btn" type="submit">
            {isEmployee ? "Увійти в систему" : "Увійти"}
          </button>
        </form>

        {message && (
          <p className="auth-text" style={{ fontWeight: "bold" }}>
            {message}
          </p>
        )}

        {!isEmployee && (
          <p className="auth-text">
            Немає акаунту?{" "}
            <a href="/register" className="auth-link">
              Зареєструватися (Клієнт)
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;