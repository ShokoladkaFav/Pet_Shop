
import React, { useEffect, useState } from "react";
import styles from "./Sale.module.css";

// 🏷️ ТУТ МОЖНА ЗМІНЮВАТИ ID ТОВАРІВ, ЯКІ БУДУТЬ НА АКЦІЇ
const SALE_IDS = [1, 2, 5, 7]; 

interface Product {
  product_id: number;
  name: string;
  description: string;
  image_url?: string;
  price: number; // Це вже буде знижена ціна
  original_price: number; // Це стара ціна
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
    // 1. Завантажуємо ВСІ товари
    fetch("http://localhost/zoo-api/getProducts.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Помилка завантаження даних із сервера");
        }
        return response.json();
      })
      .then((data: any[]) => {
        // 2. Фільтруємо: залишаємо тільки ті, що є в списку SALE_IDS
        const saleItems = data.filter((item) => SALE_IDS.includes(item.product_id));

        // 3. Робимо магію знижок (20%)
        const processedItems: Product[] = saleItems.map((item) => {
          const originalPrice = Number(item.price);
          const discountedPrice = Number((originalPrice * 0.8).toFixed(2)); // Знижка 20%

          return {
            product_id: item.product_id,
            name: item.name,
            description: item.description,
            image_url: item.image_url,
            original_price: originalPrice,
            price: discountedPrice,
          };
        });

        setProducts(processedItems);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Помилка при отриманні даних:", err);
        setError("Не вдалося завантажити товари. Спробуйте пізніше.");
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
    const existingIndex = currentCart.findIndex(
      (item: any) => item.product_id === product.product_id
    );

    if (existingIndex !== -1) {
      currentCart[existingIndex].quantity += 1;
      
      // 🔥 ВАША УЛЮБЛЕНА ФІЧА:
      // Якщо товар вже був у кошику за вищою ціною (звичайною),
      // а зараз ми додаємо його з акції — оновлюємо ціну на акційну!
      if (currentCart[existingIndex].price > product.price) {
         currentCart[existingIndex].price = product.price;
      }
    } else {
      currentCart.push({
        ...product,
        price: product.price, // Додаємо в кошик вже нову, акційну ціну
        quantity: 1,
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(currentCart));
    window.dispatchEvent(new Event("storage"));

    // 🔔 Додаємо повідомлення замість alert
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
      <div className={styles.sale}>
        <h1>🎉 Акції</h1>
        <p>Завантаження акційних пропозицій...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.sale}>
        <h1>🎉 Акції</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.sale}>
      {/* Контейнер для повідомлень */}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <div key={toast.id} className={styles.toast}>
            <span>{toast.text}</span>
            <button
              className={styles.closeBtn}
              onClick={() => removeToast(toast.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <h1>🎉 Акційні товари</h1>
      <p>Знижка 20% на обрані товари!</p>

      <div className={styles.saleGrid}>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.product_id} className={styles.saleCard}>
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

              <div className={styles.priceBlock}>
                <span className={styles.oldPrice}>
                  {product.original_price} грн
                </span>
                <span className={styles.discountedPrice}>{product.price} грн</span>
              </div>

              <button
                className={styles.btn}
                onClick={() => addToCart(product)}
              >
                🛒 В кошик
              </button>
            </div>
          ))
        ) : (
          <p>Наразі акційних товарів немає або вони не знайдені за вказаними ID 🐾</p>
        )}
      </div>
    </div>
  );
};

export default Sale;
