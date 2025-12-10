
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const EmployeeLogin: React.FC = () => {
  const [workEmail, setWorkEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workEmail.trim() || !password.trim()) {
      setMessage("⚠️ Введіть робочий Email та пароль.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost/zoo-api/employee_login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          work_email: workEmail.trim(), 
          password: password.trim() 
        }),
      });

      // Безпечна обробка відповіді (на випадок PHP помилок)
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Server Error:", text);
        throw new Error("Сервер повернув помилку. Перевірте консоль.");
      }

      if (data.status === "success") {
        if (data.token) {
          sessionStorage.setItem("employee_token", data.token);
        } else {
          sessionStorage.setItem("employee_token", "dummy_token");
        }
        
        sessionStorage.setItem("employee", JSON.stringify(data.employee));
        window.dispatchEvent(new Event("storage")); // Оновлюємо Navbar
        
        setMessage("✅ Вхід успішний! Переходимо в кабінет...");
        setTimeout(() => navigate("/worker-dashboard"), 1000);
      } else {
        setMessage(`❌ ${data.message || "Помилка входу."}`);
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      setMessage("❌ Помилка з'єднання з сервером.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>💼 Вхід для персоналу</h2>
        <p style={{marginBottom: "20px", color: "#666"}}>Використовуйте робочий email</p>
        
        <form className="auth-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Робочий Email (напр. worRasel...)"
            value={workEmail}
            onChange={(e) => setWorkEmail(e.target.value)}
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
              title={showPassword ? "Приховати" : "Показати"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button className="auth-btn" type="submit" disabled={loading} style={{background: "linear-gradient(90deg, #455a64, #37474f)"}}>
            {loading ? "Перевірка..." : "Увійти в систему"}
          </button>
        </form>

        {message && (
          <p className="auth-text" style={{ fontWeight: "bold", color: message.startsWith("✅") ? "green" : "red" }}>
            {message}
          </p>
        )}
        
        <p className="auth-text">
          <a href="/login" className="auth-link">← Повернутися до звичайного входу</a>
        </p>
      </div>
    </div>
  );
};

export default EmployeeLogin;
