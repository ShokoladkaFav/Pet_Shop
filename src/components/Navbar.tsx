
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useEffect, useState } from "react";

interface User {
  user_id?: number;
  id?: number;
  username: string;
  email: string;
  isEmployee?: boolean;
}

function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // 🛠 Функція для отримання унікального ключа кошика (спільна для всього додатка)
  const getCartKey = () => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const uid = parsed.user_id || parsed.id;
        if (uid) return `cart_${uid}`;
      } catch (e) {}
    }

    let guestId = sessionStorage.getItem("guest_session_id");
    if (!guestId) {
      guestId = "guest_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      sessionStorage.setItem("guest_session_id", guestId);
    }
    return `cart_${guestId}`;
  };

  const updateCartCount = () => {
    try {
      const key = getCartKey();
      const cart = JSON.parse(localStorage.getItem(key) || "[]");
      const total = cart.reduce(
        (sum: number, item: any) => sum + (Number(item.quantity) || 0),
        0
      );
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  };

  const checkUser = () => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        return parsed;
      } catch (e) {}
    }

    const storedEmployee = sessionStorage.getItem("employee");
    if (storedEmployee && storedEmployee !== "undefined") {
       try {
         const parsedEmp = JSON.parse(storedEmployee);
         let empName = parsedEmp.first_name ? `${parsedEmp.first_name} ${parsedEmp.last_name || ''}`.trim() : (parsedEmp.name || "Співробітник");
         const empUser: User = { username: empName + " (Staff)", email: parsedEmp.work_email || "", isEmployee: true };
         setUser(empUser);
         return empUser;
       } catch (e) {}
    }

    setUser(null);
    return null;
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("user_token");
    sessionStorage.removeItem("employee");
    sessionStorage.removeItem("employee_token");
    setUser(null);
    updateCartCount();
    navigate("/login");
  };

  useEffect(() => {
    checkUser();
    updateCartCount();

    // Слухаємо подію 'storage' (вона спрацьовує при змінах в інших вкладках АБО при ручному виклику в поточному вікні)
    const handleCartUpdate = () => {
      checkUser();
      updateCartCount();
    };

    window.addEventListener("storage", handleCartUpdate);
    // Додаємо власну подію для миттєвого оновлення в межах однієї вкладки
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="logo">ZooMarket</Link>
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
      <div className="auth-section">
        {user ? (
          <div className="user-menu">
            {user.isEmployee ? (
                <Link to="/worker-dashboard" className="username" style={{color: '#ffcc80'}}>💼 {user.username}</Link>
            ) : (
                <Link to="/account" className="username">👋 {user.username}</Link>
            )}
            <button onClick={handleLogout} className="logout-btn">Вийти</button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button onClick={() => navigate("/login")} className="login-btn">Увійти</button>
            <button onClick={() => navigate("/register")} className="register-btn">Реєстрація</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
