import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Account.css";

interface UserData {
  user_id: number;
  username: string;
  email: string;
  address?: string;
  phone?: string;
}

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (!parsedUser || !parsedUser.username) {
            throw new Error("Invalid user data");
        }
        setUser(parsedUser);
        setAddress(parsedUser.address || "");
        setPhone(parsedUser.phone || "");
      } catch (e) {
        console.error("Error parsing user data", e);
        sessionStorage.removeItem("user"); // Clear invalid data
        navigate("/login");
      }
    } else {
      // Якщо користувача немає в sessionStorage (нова вкладка), негайно перенаправляємо
      navigate("/login");
    }
  }, [navigate]);

  // 🛡️ Валідація телефону: тільки цифри та "+", макс 13 символів
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Регулярний вираз: дозволяє "+" тільки на початку, далі лише цифри
    if (/^\+?[0-9]*$/.test(val) && val.length <= 13) {
      setPhone(val);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");

    // 🛡️ FRONTEND ЗАХИСТ ВІД SQL-ІН'ЄКЦІЙ (Basic)
    const dangerousPattern = /('|"|;|--|\/\*|\*\/|xp_|DROP|SELECT|INSERT|UPDATE|DELETE|UNION)/i;
    
    if (dangerousPattern.test(address)) {
      setMessage("⚠️ Адреса містить недопустимі символи! Будь ласка, приберіть лапки або спецсимволи.");
      setLoading(false);
      return;
    }

    if (address.length > 255) {
      setMessage("⚠️ Адреса занадто довга (макс 255 символів).");
      setLoading(false);
      return;
    }

    if (phone.length < 10) {
       setMessage("⚠️ Номер телефону занадто короткий.");
       setLoading(false);
       return;
    }

    const token = sessionStorage.getItem("user_token");

    try {
      const response = await fetch("http://localhost/zoo-api/update_user.php", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🔑 Додаємо JWT токен
        },
        body: JSON.stringify({
          user_id: user.user_id,
          address: address.trim(), // Trim прибирає зайві пробіли
          phone: phone.trim(),
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        const updatedUser = { ...user, address, phone };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new Event("storage"));
        setMessage("✅ Дані успішно оновлено!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ " + (data.message || "Помилка при оновленні."));
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Сервер недоступний. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("user_token");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  if (!user) {
    return null; 
  }

  return (
    <div className="account-wrapper">
      <div className="account-container">
        
        {/* Ліва колонка - Профіль */}
        <div className="account-sidebar">
          <div className="info-card">
            <div className="avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <h2>{user.username}</h2>
            <p className="email-text">{user.email}</p>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Вийти
            </button>
          </div>
        </div>

        {/* Права колонка - Редагування */}
        <div className="account-main">
          <div className="header-section">
            <h2>⚙️ Налаштування профілю</h2>
            <p>Оновіть ваші контактні дані для швидшої доставки</p>
          </div>

          <div className="form-card">
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>☎️ Номер телефону:</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+380XXXXXXXXX"
                    maxLength={13} // Обмеження довжини в HTML
                  />
                </div>
                <div className="form-group">
                  <label>📍 Адреса доставки:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="м. Київ, вул. Хрещатик, 1"
                    maxLength={255} // Обмеження довжини в HTML
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "⏳ Збереження..." : "💾 Зберегти зміни"}
                </button>
              </div>
            </form>
            
            {message && (
              <p className={`status-message ${message.startsWith("✅") ? "success" : "error"}`}>
                {message}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Account;