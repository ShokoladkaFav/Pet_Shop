import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useEffect, useState } from "react";

interface User {
  user_id?: number;
  id?: number;
  username: string;
  email: string;
  isEmployee?: boolean; // Флаг для співробітників
}

function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // 🛠 Допоміжна функція для отримання правильного ключа кошика
  const getCartKey = (currentUser: User | null) => {
    if (currentUser && !currentUser.isEmployee) {
      const uid = currentUser.user_id || currentUser.id;
      return uid ? `cart_${uid}` : "cart";
    }
    
    // Для працівників або гостей використовуємо гостьову сесію або загальний кошик
    let guestId = sessionStorage.getItem("guest_session_id");
    if (!guestId) {
      guestId = "guest_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem("guest_session_id", guestId);
    }
    return `cart_${guestId}`;
  };

  // 🔄 Оновлення кількості товарів у кошику
  const updateCartCount = (currentUser: User | null) => {
    try {
      const key = getCartKey(currentUser);
      const cart = JSON.parse(localStorage.getItem(key) || "[]");
      const total = cart.reduce(
        (sum: number, item: any) => sum + (item.quantity || 0),
        0
      );
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  };

  // 🧭 Завантаження користувача АБО працівника з sessionStorage
  const checkUser = () => {
    // 1. Перевіряємо звичайного юзера
    const storedUser = sessionStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        return parsed;
      } catch (e) {}
    }

    // 2. Перевіряємо працівника
    const storedEmployee = sessionStorage.getItem("employee");
    if (storedEmployee && storedEmployee !== "undefined") {
       try {
         const parsedEmp = JSON.parse(storedEmployee);
         
         // 🛠 Fix #2: Формуємо ім'я з first_name/last_name (структура БД)
         let empName = "";
         if (parsedEmp.first_name) {
             empName = `${parsedEmp.first_name} ${parsedEmp.last_name || ''}`.trim();
         } else if (parsedEmp.name) {
             empName = parsedEmp.name;
         } else {
             empName = "Співробітник";
         }

         // Адаптуємо під інтерфейс User для відображення
         const empUser: User = {
           username: empName + " (Staff)",
           email: parsedEmp.work_email || "",
           isEmployee: true
         };
         setUser(empUser);
         return empUser;
       } catch (e) {}
    }

    setUser(null);
    return null;
  };

  // 🚪 Вихід із акаунту
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("employee");
    setUser(null);
    updateCartCount(null);
    navigate("/login");
  };

  // 🛠️ DEV TOOL: Швидкий вхід в адмінку (Тимчасова функція)
  const handleAdminQuickAccess = () => {
    // Симулюємо об'єкт, який повертає employee_login.php
    const mockAdmin = {
      employee_id: 999,
      first_name: "Super",
      last_name: "Admin",
      work_email: "admin@zoo.com",
      position: "Адмін" // Українська назва з БД
    };
    sessionStorage.setItem("employee", JSON.stringify(mockAdmin));
    
    window.dispatchEvent(new Event("storage"));
    navigate("/worker-dashboard");
  };

  useEffect(() => {
    const currentUser = checkUser();
    updateCartCount(currentUser);

    const handleStorageChange = () => {
      const updatedUser = checkUser();
      updateCartCount(updatedUser);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        ZooMarket
      </Link>

      <ul className="nav-links">
        <li><Link to="/">Головна</Link></li>
        <li><Link to="/products">Товари</Link></li>
        <li><Link to="/animals">Тварини</Link></li>
        <li><Link to="/about">Про нас</Link></li>
        <li><Link to="/contacts">Контакти</Link></li>
        <li>
          <Link to="/cart" className="cart-link">
            🛒 Кошик <span className="cart-count">({cartCount})</span>
          </Link>
        </li>
      </ul>

      {/* 🔐 Авторизаційна секція */}
      <div className="auth-section">
        {user ? (
          <div className="user-menu">
            {user.isEmployee ? (
                <Link to="/worker-dashboard" className="username" style={{color: '#ffcc80'}}>
                   💼 {user.username}
                </Link>
            ) : (
                <Link to="/account" className="username">
                   👋 {user.username}
                </Link>
            )}
            
            <button onClick={handleLogout} className="logout-btn">
              Вийти
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button onClick={handleAdminQuickAccess} className="admin-btn">
              Адмін панель
            </button>
            
            <button onClick={() => navigate("/login")} className="login-btn">
              Увійти
            </button>
            <button onClick={() => navigate("/register")} className="register-btn">
              Реєстрація
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;