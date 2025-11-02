import React, { useEffect, useState } from "react";
import "./Cats.css";

interface Product {
  name: string;
  price: number;
  description: string;
  image_url?: string;
}

interface ToastMessage {
  id: number;
  text: string;
}

const Cats: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    fetch("http://localhost/zoo-api/Cats.php")
      .then((response) => {
        if (!response.ok) throw new Error("Помилка завантаження даних із сервера");
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Помилка при отриманні даних:", err);
        setError("Не вдалося завантажити товари. Спробуйте пізніше.");
        setLoading(false);
      });
  }, []);

  // 🛒 Додати товар у кошик
  const addToCart = (product: Product) => {
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = currentCart.find((item: any) => item.name === product.name);

    if (existing) {
      existing.quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("storage")); // 🔄 щоб Navbar оновився

    // 📢 Показати toast
    const newToast: ToastMessage = {
      id: Date.now(),
      text: `✅ ${product.name} додано у кошик!`,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => removeToast(newToast.id), 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (loading) {
    return (
      <div className="cats">
        <h1>Коти 🐱</h1>
        <p>Завантаження товарів...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cats">
        <h1>Коти 🐱</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="cats">
      {/* 🔔 Контейнер toast-повідомлень */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <span>{toast.text}</span>
            <button className="close-btn" onClick={() => removeToast(toast.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <h1>Коти 🐱</h1>
      <p>Все, що потрібно для ваших улюбленців!</p>

      <div className="cats-grid">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={index} className="cat-card">
              <img
                src={
                  product.image_url && product.image_url.trim() !== ""
                    ? product.image_url
                    : "https://placehold.co/300x200?text=Фото+нема"
                }
                alt={product.name}
              />
              <h3>{product.name}</h3>
              <p className="desc">{product.description}</p>
              <p className="price">{product.price} грн</p>
              <button className="btn" onClick={() => addToCart(product)}>
                В кошик
              </button>
            </div>
          ))
        ) : (
          <p>Немає товарів у цій категорії 🐾</p>
        )}
      </div>
    </div>
  );
};

export default Cats;
