
import React, { useState, useEffect } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [message, setMessage] = useState("");
  const [isEmployee, setIsEmployee] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost/zoo-api/get_csrf.php")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrf_token))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMessage("");
    // Очищаємо поля при зміні типу входу
    setEmail("");
    setPassword("");
  }, [isEmployee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage("⚠️ Будь ласка, заповніть всі поля.");
      return;
    }

    setLoading(true);
    setMessage("");

    const endpoint = isEmployee
      ? "http://localhost/zoo-api/employee_login.php"
      : "http://localhost/zoo-api/login_user.php";

    // Очищаємо пробіли
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    const payload = isEmployee
      ? { work_email: cleanEmail, password: cleanPassword }
      : { email: cleanEmail, password: cleanPassword, csrf_token: csrfToken };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error("JSON Parse Error. Server sent:", text);
        throw new Error("Сервер повернув невірний формат даних.");
      }

      if (result.status === "success") {
        if (isEmployee) {
          sessionStorage.setItem("employee", JSON.stringify(result.employee));
          if (result.token) {
             sessionStorage.setItem("employee_token", result.token);
          } else {
             sessionStorage.setItem("employee_token", "dummy_token"); 
          }
          
          window.dispatchEvent(new Event("storage"));
          setMessage("✅ Вхід успішний! Завантаження робочого місця...");
          setTimeout(() => navigate("/worker-dashboard"), 1000);

        } else {
          sessionStorage.setItem("user", JSON.stringify(result.user));
          sessionStorage.setItem("user_token", "dummy_user_token"); 
          
          window.dispatchEvent(new Event("storage"));
          setMessage("✅ Вхід успішний! Перенаправлення...");
          setTimeout(() => navigate("/account"), 1000);
        }
      } else {
        setMessage(`❌ ${result.message || "Невірний логін або пароль."}`);
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.message.includes("Failed to fetch")) {
        setMessage("❌ Помилка з'єднання. Сервер недоступний.");
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
        <h2>{isEmployee ? "Вхід для персоналу" : "Вхід у ZooMarket"}</h2>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type={isEmployee ? "email" : "text"}
            placeholder={isEmployee ? "Ваш work_email (напр. worRasel...)" : "Email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          
          <div className="password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
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
              title={showPassword ? "Приховати пароль" : "Показати пароль"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px", justifyContent: "center" }}>
            <input
              type="checkbox"
              id="employeeCheck"
              checked={isEmployee}
              onChange={(e) => setIsEmployee(e.target.checked)}
              style={{ width: "auto", margin: 0 }}
            />
            <label htmlFor="employeeCheck" style={{ color: "#2e7d32", fontWeight: "600", cursor: "pointer", fontSize: "0.9rem" }}>
              Я співробітник
            </label>
          </div>

          <button className="auth-btn" type="submit" disabled={loading} style={isEmployee ? {background: "linear-gradient(90deg, #455a64, #37474f)"} : {}}>
            {loading ? "Перевірка..." : "Увійти"}
          </button>
        </form>

        {message && (
          <p className="auth-text" style={{ fontWeight: "bold", color: message.startsWith("✅") ? "green" : "red" }}>
            {message}
          </p>
        )}

        {!isEmployee && (
          <p className="auth-text">
            Немає акаунту?{" "}
            <a href="/register" className="auth-link">
              Зареєструватися
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
