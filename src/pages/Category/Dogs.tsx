import React, { useEffect, useState } from "react";
import styles from "./Dogs.module.css";

interface Product {
  name: string;
  price: number;
  description: string;
  image_url?: string;
}

const Dogs: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Отримуємо товари з PHP
  useEffect(() => {
    fetch("http://localhost/zoo-api/Dogs.php")
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

  // ✅ Функція для додавання товару до кошика
  const addToCart = (product: Product) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Перевірка чи товар вже є у кошику
    const existingItem = existingCart.find(
      (item: any) => item.name === product.name
    );

    let updatedCart;
    if (existingItem) {
      updatedCart = existingCart.map((item: any) =>
        item.name === product.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...existingCart, { ...product, quantity: 1 }];
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    alert(`✅ ${product.name} додано до кошика!`);
  };

  // 🌀 Стан завантаження
  if (loading)
    return (
      <div className={styles.dogs}>
        <h1>Собаки 🐶</h1>
        <p>Завантаження товарів...</p>
      </div>
    );

  // ❌ Помилка завантаження
  if (error)
    return (
      <div className={styles.dogs}>
        <h1>Собаки 🐶</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );

  // 🐕 Відображення товарів
  return (
    <div className={styles.dogs}>
      <h1>Собаки 🐶</h1>
      <p>Все для ваших найвірніших друзів!</p>

      <div className={styles.dogsGrid}>
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={index} className={styles.dogCard}>
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

export default Dogs;
