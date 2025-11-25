import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const EmployeeLogin: React.FC = () => {
  const [workEmail, setWorkEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost/zoo-api/employee_login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ work_email: workEmail, password }),
      });

      const data = await response.json();

      if (data.status === "success") {
        localStorage.setItem("employee", JSON.stringify(data.employee));
        navigate("/worker-dashboard");
      } else {
        setMessage(data.message || "Помилка входу. Перевірте дані.");
      }
    } catch (error) {
      console.error("Помилка:", error);
      setMessage("Помилка сервера. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Вхід працівника</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Робочий Email"
            value={workEmail}
            onChange={(e) => setWorkEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Вхід..." : "Увійти"}
          </button>
        </form>
        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
};

export default EmployeeLogin;