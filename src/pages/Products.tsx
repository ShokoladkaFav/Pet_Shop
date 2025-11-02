import React, { useEffect, useState } from "react";
import "./Products.css";

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
}

interface ToastMessage {
  id: number;
  text: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    fetch("http://localhost/zoo-api/getProducts.php")
      .then((response) => {
        if (!response.ok) throw new Error("Помилка завантаження даних");
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Помилка при отриманні товарів:", err);
        setError("Не вдалося завантажити товари. Спробуйте пізніше.");
        setLoading(false);
      });
  }, []);

  // 🛒 Функція додавання до кошика
  const addToCart = (product: Product) => {
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = currentCart.find(
      (item: any) => item.product_id === product.product_id
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("storage")); // 🔄 Оновлює Navbar

    // 📢 Показуємо повідомлення (toast)
    const newToast: ToastMessage = {
      id: Date.now(),
      text: `✅ ${product.name} додано у кошик!`,
    };
    setToasts((prev) => [...prev, newToast]);

    // ⏳ Автоматичне зникнення через 5 секунд
    setTimeout(() => removeToast(newToast.id), 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (loading)
    return (
      <div className="products-container">
        <h1>Каталог товарів</h1>
        <p>Завантаження...</p>
      </div>
    );

  if (error)
    return (
      <div className="products-container">
        <h1>Каталог товарів</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );

  return (
    <div className="products-container">
      {/* 🔔 Вікна повідомлень */}
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

      <h1>Каталог товарів</h1>
      <div className="products-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.product_id} className="product-card">
              <img
                src={
                  product.image_url && product.image_url.trim() !== ""
                    ? product.image_url
                    : "https://placehold.co/300x200?text=Фото+нема"
                }
                alt={product.name}
                className="product-image"
              />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <p className="price">{product.price} грн</p>
              <button
                className="buy-button"
                onClick={() => addToCart(product)}
              >
                🛒 В кошик
              </button>
            </div>
          ))
        ) : (
          <p>Наразі товари відсутні 🐾</p>
        )}
      </div>
    </div>
  );
};

export default Products;
