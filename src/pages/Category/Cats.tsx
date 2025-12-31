
import React, { useEffect, useState } from "react";
import "./Cats.css";

interface Product {
  product_id: number;
  name: string;
  price: number;
  description: string;
  image_url?: string;
  quantity?: number;
}

interface ToastMessage {
  id: number;
  text: string;
}

const Cats: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("http://localhost/zoo-api/Cats.php")
      .then(async (response) => {
        const text = await response.text();
        try {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return JSON.parse(text);
        } catch (e) {
            throw new Error("Помилка на сервері.");
        }
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const cleaned = data.map(p => ({
            ...p,
            name: p.name.replace(/\[SALE\]/gi, "").trim(),
            description: p.description.replace(/\[SALE\]/gi, "").trim()
          }));
          setProducts(cleaned);
        }
        setLoading(false);
      })
      .catch((err) => {
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
      } catch (e) {}
    }
    
    if (!cartKey) {
      let guestId = sessionStorage.getItem("guest_session_id");
      if (!guestId) {
        guestId = "guest_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        sessionStorage.setItem("guest_session_id", guestId);
      }
      cartKey = `cart_${guestId}`;
    }

    const currentCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existingIndex = currentCart.findIndex((item: any) => item.product_id === product.product_id);

    if (existingIndex !== -1) {
      currentCart[existingIndex].quantity = (Number(currentCart[existingIndex].quantity) || 0) + 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(currentCart));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("cart-updated"));

    const newToast: ToastMessage = { id: Date.now(), text: `✅ ${product.name} додано!` };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== newToast.id)), 3000);
  };

  if (loading) return <div className="cats"><h1>Коти 🐱</h1><p>Завантаження...</p></div>;

  return (
    <div className="cats">
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <span>{toast.text}</span>
          </div>
        ))}
      </div>
      <h1>Коти 🐱</h1>
      <div className="cats-grid">
        {products.map((product) => (
          <div key={product.product_id} className="cat-card">
            <img src={product.image_url || "https://placehold.co/300x200?text=Немає+фото"} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="desc">{product.description}</p>
            
            <button className="details-btn-cat" onClick={() => setSelectedProduct(product)}>
              Подробніше
            </button>

            <div className="price-block">
                <p className="price">{product.price} грн</p>
                <span className={`stock-status ${(product.quantity || 0) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {(product.quantity || 0) > 0 ? 'В наявності' : 'Немає в наявності'}
                </span>
            </div>
            <button className="btn" onClick={() => addToCart(product)} disabled={(product.quantity || 0) <= 0}>
                {(product.quantity || 0) > 0 ? 'В кошик' : 'Очікується'}
            </button>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="details-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="details-modal" onClick={e => e.stopPropagation()}>
            <div className="details-modal-content">
              <div className="details-image-container">
                <img src={selectedProduct.image_url || "https://placehold.co/400x300?text=Немає+фото"} alt={selectedProduct.name} />
              </div>
              <h2>{selectedProduct.name}</h2>
              <div className="details-info-list">
                <p><strong>Опис:</strong> {selectedProduct.description}</p>
                <p><strong>Для кого:</strong> Коти 🐱</p>
                <p><strong>Ціна:</strong> {selectedProduct.price} грн</p>
              </div>
              <button className="close-details-btn" onClick={() => setSelectedProduct(null)}>Закрити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cats;
