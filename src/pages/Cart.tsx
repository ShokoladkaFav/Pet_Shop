
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
  const [cartKey, setCartKey] = useState("");
  const navigate = useNavigate();

  const getActiveCartKey = () => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const uid = user.user_id || user.id;
        if (uid) return `cart_${uid}`;
      } catch (e) {}
    }

    let guestId = sessionStorage.getItem("guest_session_id");
    if (!guestId) {
      guestId = "guest_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      sessionStorage.setItem("guest_session_id", guestId);
    }
    return `cart_${guestId}`;
  };

  useEffect(() => {
    const key = getActiveCartKey();
    setCartKey(key);
    const savedCart = localStorage.getItem(key);
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("cart-updated"));
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

  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

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
        if (data.status === 'error') {
            alert("Помилка: " + data.message);
        } else {
            setShowModal(true);
            localStorage.removeItem(cartKey);
            setCart([]);
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new Event("cart-updated"));
        }
      })
      .catch(() => alert("Помилка з'єднання з сервером."));
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
                <img src={item.image_url || "https://placehold.co/200x150?text=Немає+фото"} alt={item.name} />
                <div className="cart-info">
                  <h3>{item.name}</h3>
                  <p>{item.price} грн</p>
                  <div className="quantity-input">
                    <label>Кількість:</label>
                    <input type="number" min={1} max={100} value={item.quantity} onChange={(e) => handleQuantityChange(item.product_id, Number(e.target.value))} />
                  </div>
                  <button className="remove-btn" onClick={() => removeItem(item.product_id)}>❌ Видалити</button>
                </div>
              </div>
            ))}
          </div>
          <h2 className="total">💰 Сума: {total.toFixed(2)} грн</h2>
          <button className="order-btn" onClick={handleOrder}>✅ Підтвердити</button>
        </>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>✅ Замовлення прийнято!</h2>
            <p>Очікуйте на дзвінок менеджера 💬</p>
            <button onClick={() => { setShowModal(false); navigate("/"); }} className="close-modal-btn">На головну</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
