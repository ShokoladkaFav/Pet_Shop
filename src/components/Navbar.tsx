import { Link } from "react-router-dom";
import "./Navbar.css";
import { useEffect, useState } from "react";

function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  // 🔄 Оновлення кількості товарів у кошику
  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const total = cart.reduce(
        (sum: number, item: any) => sum + (item.quantity || 0),
        0
      );
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    // 🧭 Оновлення при першому рендері
    updateCartCount();

    // 🔁 Слухаємо зміни в localStorage (додавання/видалення/очищення)
    window.addEventListener("storage", updateCartCount);

    // 🧹 Прибираємо слухача при демонтажі компонента
    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        ZooMarket
      </Link>

      <ul className="nav-links">
        <li>
          <Link to="/">Головна</Link>
        </li>
        <li>
          <Link to="/products">Товари</Link>
        </li>
        <li>
          <Link to="/animals">Тварини</Link>
        </li>
        <li>
          <Link to="/about">Про нас</Link>
        </li>
        <li>
          <Link to="/contacts">Контакти</Link>
        </li>
        <li>
          <Link to="/cart" className="cart-link">
            🛒 Кошик{" "}
            <span className="cart-count">
              ({cartCount > 0 ? cartCount : 0})
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
