import React, { useEffect, useState } from "react";
import styles from "./Sale.module.css";

// 🔄 ОНОВЛЕНО: Інтерфейс відповідає Sale.php (Doctrine)
interface Product {
  product_id: number;
  name: string;
  description: string;
  image_url?: string;
  price: number; // Нова ціна (знижена)
  original_price: number; // Стара ціна
}

interface ToastMessage {
  id: number;
  text: string;
}

const Sale: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    fetch("http://localhost/zoo-api/Sale.php")
      .then(async (response) => {
        const text = await response.text();
        try {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return JSON.parse(text);
        } catch (e) {
            console.error("❌ BACKEND ERROR (Raw output):", text);
            throw new Error("Сервер повернув HTML-помилку. Див. консоль.");
        }
      })
      .then((data) => {
        if (Array.isArray(data)) {
            setProducts(data);
        } else if (data.error) {
            throw new Error(data.error);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Помилка при отриманні даних:", err);
        setError(err.message || "Не вдалося завантажити акційні пропозиції.");
        setLoading(false);
      });
  }, []);

  const addToCart = (product: Product) => {
    const userStr = sessionStorage.getItem("user");
    let cartKey = "";
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const uid = user.user_id || user.id;
        if (uid) cartKey = `cart_${uid}`;
      } catch (e) { console.error(e); }
    }

    if (!cartKey) {
      let guestId = sessionStorage.getItem("guest_session_id");
      if (!guestId) {
        guestId = "guest_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem("guest_session_id", guestId);
      }
      cartKey = `cart_${guestId}`;
    }

    const currentCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existingIndex = currentCart.findIndex(
      (item: any) => item.product_id === product.product_id
    );

    if (existingIndex !== -1) {
      currentCart[existingIndex].quantity += 1;
      // Оновлюємо ціну на акційну, якщо вона була вищою
      if (currentCart[existingIndex].price > product.price) {
         currentCart[existingIndex].price = product.price;
      }
    } else {
      currentCart.push({
        ...product,
        price: product.price,
        quantity: 1,
      });
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

  if (loading) return <div className={styles.sale}><h1>🎉 Акції</h1><p>Шукаємо знижки...</p></div>;
  if (error) return <div className={styles.sale}><h1>🎉 Акції</h1><p style={{ color: "red", fontWeight: "bold" }}>{error}</p><p style={{fontSize: "0.9rem", color: "#666"}}>Перевірте консоль (F12) для деталей.</p></div>;

  return (
    <div className={styles.sale}>
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <div key={toast.id} className={styles.toast}>
            <span>{toast.text}</span>
            <button className={styles.closeBtn} onClick={() => removeToast(toast.id)}>✕</button>
          </div>
        ))}
      </div>

      <h1>🎉 Акційні товари</h1>
      <p>Встигніть придбати зі знижкою 20%!</p>

      <div className={styles.saleGrid}>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.product_id} className={styles.saleCard}>
              <img
                src={product.image_url && product.image_url.trim() !== "" ? product.image_url : "https://placehold.co/300x200?text=Фото+нема"}
                alt={product.name}
              />
              <h3>{product.name}</h3>
              <p className={styles.desc}>{product.description}</p>
              <div className={styles.priceBlock}>
                <span className={styles.oldPrice}>{product.original_price} грн</span>
                <span className={styles.discountedPrice}>{product.price} грн</span>
              </div>
              <button className={styles.btn} onClick={() => addToCart(product)}>🛒 В кошик</button>
            </div>
          ))
        ) : (
          <p>Наразі акційних пропозицій немає 🐾</p>
        )}
      </div>
    </div>
  );
};

export default Sale;