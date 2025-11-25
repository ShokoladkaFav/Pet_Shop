import React, { useEffect, useState } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [cartKey, setCartKey] = useState("cart");
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Визначаємо ключ кошика (користувач з sessionStorage або гість)
    const userStr = sessionStorage.getItem("user");
    let key = "";

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const uid = user.user_id || user.id;
        if (uid) key = `cart_${uid}`;
      } catch (e) {
        console.error("Error parsing user for cart key", e);
      }
    }

    // Якщо користувача немає, використовуємо гостьову сесію
    if (!key) {
      let guestId = sessionStorage.getItem("guest_session_id");
      if (!guestId) {
        guestId = "guest_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem("guest_session_id", guestId);
      }
      key = `cart_${guestId}`;
    }

    setCartKey(key);

    // 2. Завантажуємо кошик по цьому ключу (Кошик зберігається в localStorage для надійності)
    const savedCart = localStorage.getItem(key);
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    // Відправляємо подію, щоб оновити Navbar
    window.dispatchEvent(new Event("storage"));
  };

  const handleQuantityChange = (id: number, value: number) => {
    if (value < 1 || value > 100) return;
    const updatedCart = cart.map((item) =>
      item.product_id === id ? { ...item, quantity: value } : item
    );
    saveCart(updatedCart);
  };

  const removeItem = (id: number) => {
    saveCart(cart.filter((item) => item.product_id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = () => {
    if (cart.length === 0) {
      alert("Ваш кошик порожній 😿");
      return;
    }

    const isValid = cart.every(item => item.product_id !== undefined);
    if (!isValid) {
        alert("Помилка даних кошика. Спробуйте очистити кошик і додати товари знову.");
        return;
    }

    fetch("http://localhost/zoo-api/placeOrder.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cart),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'error') {
            alert("Помилка сервера: " + data.message);
        } else {
            setShowModal(true);
            localStorage.removeItem(cartKey); // Очищаємо правильний кошик
            setCart([]);
            window.dispatchEvent(new Event("storage"));
        }
      })
      .catch((err) => {
        console.error("❌ Помилка оформлення замовлення:", err);
        alert("Не вдалося оформити замовлення. Спробуйте пізніше.");
      });
  };

  const closeModal = () => {
    setShowModal(false);
    navigate("/");
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

                  <div className="quantity-input">
                    <label>Кількість:</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.product_id,
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.product_id)}
                  >
                    ❌ Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="total">💰 Загальна сума: {total.toFixed(2)} грн</h2>

          <button className="order-btn" onClick={handleOrder}>
            ✅ Підтвердити замовлення
          </button>
        </>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>✅ Замовлення прийнято!</h2>
            <p>
              Ваше замовлення на обробці. Найближчим часом з вами зв’яжеться наш
              менеджер 💬
            </p>
            <button onClick={closeModal} className="close-modal-btn">
              Повернутись на головну
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;