import React, { useEffect, useState } from "react";
import styles from "./Sale.module.css";

interface Product {
  name: string;
  description: string;
  image_url?: string;
  price: number; // 🔹 це вже знижена ціна
  original_price: number; // 🔹 оригінальна ціна
}

const Sale: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🎯 Завантаження акційних товарів
  useEffect(() => {
    fetch("http://localhost/zoo-api/Sale.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Помилка завантаження даних із сервера");
        }
        return response.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Помилка при отриманні даних:", err);
        setError("Не вдалося завантажити товари. Спробуйте пізніше.");
        setLoading(false);
      });
  }, []);

  // 🛒 Додавання товару в кошик
  const addToCart = (product: Product) => {
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = currentCart.findIndex(
      (item: any) => item.name === product.name
    );

    if (existingIndex !== -1) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({
        ...product,
        price: product.price, // додаємо вже знижену ціну
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("storage"));
    alert(`✅ ${product.name} додано у кошик!`);
  };

  if (loading) {
    return (
      <div className={styles.sale}>
        <h1>🎉 Акції</h1>
        <p>Завантаження товарів...</p>
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
      <h1>🎉 Акційні товари</h1>
      <p>Знижка 20% на всі обрані товари!</p>

      <div className={styles.saleGrid}>
        {products.length > 0 ? (
          products.map((product, index) => (
            <div key={index} className={styles.saleCard}>
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

              {/* 💰 Ціни */}
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
          <p>Немає акційних товарів 🐾</p>
        )}
      </div>
    </div>
  );
};

export default Sale;
