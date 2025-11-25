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

  const addToCart = (product: Product) => {
    // Визначаємо ключ кошика (перевіряємо sessionStorage)
    const userStr = sessionStorage.getItem("user");
    let cartKey = "";

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const uid = user.user_id || user.id;
        if (uid) cartKey = `cart_${uid}`;
      } catch (e) {
        console.error(e);
      }
    }

    // Якщо користувача немає, використовуємо Guest Session ID
    if (!cartKey) {
      let guestId = sessionStorage.getItem("guest_session_id");
      if (!guestId) {
        guestId = "guest_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem("guest_session_id", guestId);
      }
      cartKey = `cart_${guestId}`;
    }

    const currentCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existingItem = currentCart.find(
      (item: any) => item.product_id === product.product_id
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(currentCart));
    window.dispatchEvent(new Event("storage"));

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