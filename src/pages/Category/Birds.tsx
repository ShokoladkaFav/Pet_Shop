import React, { useEffect, useState } from "react";
import styles from "./Birds.module.css";

interface Product {
  name: string;
  price: number;
  description: string;
  image_url?: string;
}

const Birds: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🐤 Отримуємо товари з бази даних
  useEffect(() => {
    fetch("http://localhost/zoo-api/Birds.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Помилка завантаження даних із сервера");
        }
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

  // 🛒 Функція додавання товару в кошик
  const addToCart = (product: Product) => {
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Перевіряємо чи товар уже є
    const existingIndex = currentCart.findIndex(
      (item: any) => item.name === product.name
    );

    if (existingIndex !== -1) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("storage")); // 🔄 оновлення Navbar
    alert(`✅ ${product.name} додано у кошик!`);
  };

  // 🌀 Завантаження
  if (loading)
    return (
      <div className={styles.birds}>
        <h1>Пташки 🐦</h1>
        <p>Завантаження товарів...</p>
      </div>
    );

  // ❌ Помилка
  if (error)
    return (
      <div className={styles.birds}>
        <h1>Пташки 🐦</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );

  // 🐦 Відображення
  return (
    <div className={styles.birds}>
      <h1>Пташки 🐦</h1>
      <p>Все необхідне для ваших пернатих друзів!</p>

      <div className={styles.birdsGrid}>
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={index} className={styles.birdCard}>
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
              <button
                className={styles.btn}
                onClick={() => addToCart(product)}
              >
                🛒 В кошик
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

export default Birds;
