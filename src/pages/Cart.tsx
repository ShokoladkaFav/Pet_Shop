import React, { useEffect, useState } from "react";
import "./Cart.css";

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 🔄 Завантаження кошика з localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // 💾 Оновлення локального сховища + синхронізація Navbar
  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage")); // 🔁 повідомляє Navbar
  };

  // ➕➖ Зміна кількості (з авто-видаленням при 0)
  const updateQuantity = (name: string, change: number) => {
    const updatedCart = cart
      .map((item) => {
        if (item.name === name) {
          const newQty = item.quantity + change;
          if (newQty <= 0) return null; // 🧹 якщо кількість 0 — видаляємо
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    saveCart(updatedCart);
  };

  // ❌ Повне видалення товару
  const removeItem = (name: string) => {
    const updatedCart = cart.filter((item) => item.name !== name);
    saveCart(updatedCart);
  };

  // 💰 Загальна сума
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 🧾 Обробка замовлення
  const handleOrder = () => {
    if (cart.length === 0) {
      alert("Ваш кошик порожній 😿");
      return;
    }

    fetch("http://localhost/zoo-api/placeOrder.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cart),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "✅ Замовлення оформлено успішно!");
        localStorage.removeItem("cart");
        setCart([]);
        window.dispatchEvent(new Event("storage")); // 🧹 очищає лічильник у Navbar
      })
      .catch((err) => {
        console.error("❌ Помилка оформлення замовлення:", err);
        alert("Не вдалося оформити замовлення. Спробуйте пізніше.");
      });
  };

  return (
    <div className="cart">
      <h1>🛒 Ваш кошик</h1>

      {cart.length === 0 ? (
        <p>Ваш кошик порожній 😿</p>
      ) : (
        <>
          <div className="cart-grid">
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <img
                  src={
                    item.image_url && item.image_url.trim() !== ""
                      ? item.image_url
                      : "https://placehold.co/200x150?text=Фото+нема"
                  }
                  alt={item.name}
                />
                <div className="cart-info">
                  <h3>{item.name}</h3>
                  <p>{item.price} грн</p>

                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item.name, -1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.name, 1)}>
                      +
                    </button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.name)}
                  >
                    ❌ Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="total">💰 Загальна сума: {total} грн</h2>

          <button className="order-btn" onClick={handleOrder}>
            ✅ Підтвердити замовлення
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
