
import React, { useEffect, useState } from "react";
import "./Fish.css";

interface Product {
  product_id: number;
  name: string;
  price: number;
  description: string;
  long_description?: string;
  image_url?: string;
  quantity?: number;
}

interface ToastMessage {
  id: number;
  text: string;
}

const Fish: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("http://localhost/zoo-api/Fish.php")
      .then(async (response) => {
        const text = await response.text();
        try {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return JSON.parse(text);
        } catch (e) {
            throw new Error("Сервер не повернув JSON.");
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

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

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
    setTimeout(() => removeToast(newToast.id), 3000);
  };

  if (loading) return <div className="fish"><h1>Рибки 🐠</h1><p>Завантаження...</p></div>;

  return (
    <div className="fish">
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <span>{toast.text}</span>
            <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>✕</button>
          </div>
        ))}
      </div>

      <h1>Рибки 🐠</h1>
      <p>Все для догляду за вашими акваріумними улюбленцями!</p>

      <div className="fish-grid">
        {products.map((product) => (
          <div key={product.product_id} className="fish-card">
            <img src={product.image_url || "https://placehold.co/300x200?text=Немає+фото"} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="desc">{product.description}</p>
            
            <button className="details-btn-fish" onClick={() => setSelectedProduct(product)}>
              Подробніше
            </button>

            <div className="price-block">
                <p className="price">{Number(product.price).toFixed(2)} грн</p>
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
            <div className="modal-image-gallery">
              <img src={selectedProduct.image_url || "https://placehold.co/500x500?text=📦"} alt={selectedProduct.name} />
            </div>

            <div className="modal-content-list">
              <div className="spec-item">
                <span className="spec-label">Назва:</span>
                <span className="spec-value">{selectedProduct.name}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Ціна:</span>
                <span className="spec-value">{Number(selectedProduct.price).toFixed(2)} грн</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Наявність:</span>
                <span className={`spec-value ${(selectedProduct.quantity || 0) > 0 ? 'stock-positive' : 'stock-negative'}`}>
                  {(selectedProduct.quantity || 0) > 0 ? `${selectedProduct.quantity} шт.` : 'Немає в наявності'}
                </span>
              </div>
              <div className="spec-item" style={{ flexDirection: 'column', marginTop: '15px' }}>
                <span className="spec-label" style={{ marginBottom: '8px' }}>Опис:</span>
                <span className="spec-value description-text" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedProduct.long_description || selectedProduct.description || "Інформація про товар уточнюється."}
                </span>
              </div>
            </div>

            <div className="modal-footer-actions">
              {(selectedProduct.quantity || 0) > 0 && (
                <button className="modal-buy-btn" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                  Додати до кошика
                </button>
              )}
              <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fish;
