import React, { useEffect, useState } from "react";
import styles from "./Birds.module.css";

interface Product {
  product_id: number;
  name: string;
  price: number;
  description: string;
  image_url?: string;
}

interface ToastMessage {
  id: number;
  text: string;
}

const Birds: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost/zoo-api/Birds.php")
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
        setError(err.message);
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
      } catch (e) {
        console.error(e);
      }
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
    const existingIndex = currentCart.findIndex((item: any) => item.product_id === product.product_id);

    if (existingIndex !== -1) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(currentCart));
    window.dispatchEvent(new Event("storage"));

    setToastMessage(`✅ ${product.name} додано у кошик!`);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  if (loading)
    return (
      <div className={styles.birds}>
        <h1>Пташки 🐦</h1>
        <p>Завантаження товарів...</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.birds}>
        <h1>Пташки 🐦</h1>
        <p style={{ color: "red" }}>{error}</p>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>Перевірте консоль (F12) для деталей.</p>
      </div>
    );

  return (
    <div className={styles.birds}>
      <h1>Пташки 🐦</h1>
      <p>Все необхідне для ваших пернатих друзів!</p>

      <div className={styles.birdsGrid}>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.product_id} className={styles.birdCard}>
              <img
                src={
                  product.image_url && product.image_url.trim() !== ""
                    ? product.image_url
                    : "https://placehold.co/300x200?text=Фото+нема"
                }
                alt={product.name}
              />
              <h3>{product.name}</h3>
              <p className={styles.desc}>{product.description}</p>
              <p className={styles.price}>{product.price} грн</p>
              <button className={styles.btn} onClick={() => addToCart(product)}>
                🛒 В кошик
              </button>
            </div>
          ))
        ) : (
          <p>Немає товарів у цій категорії 🐾</p>
        )}
      </div>

      {showToast && (
        <div className={`${styles.toast} ${styles.show}`}>
          <span>{toastMessage}</span>
          <button className={styles.closeBtn} onClick={() => setShowToast(false)}>
            ✖
          </button>
        </div>
      )}
    </div>
  );
};

export default Birds;