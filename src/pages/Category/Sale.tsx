
import React, { useEffect, useState } from "react";
import styles from "./Sale.module.css";

interface Product {
  product_id: number;
  name: string;
  description: string;
  long_description?: string;
  image_url?: string;
  price: number; 
  original_price: number; 
  quantity: number | null; 
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("http://localhost/zoo-api/Sale.php")
      .then(async (response) => {
        const text = await response.text();
        try {
          if (!text.trim().startsWith('[') && !text.trim().startsWith('{')) {
             throw new Error("Сервер повернув неочікувану відповідь.");
          }
          if (!response.ok) throw new Error(`HTTP Помилка: ${response.status}`);
          return JSON.parse(text);
        } catch (e) {
          throw new Error("Помилка розпізнавання даних з сервера.");
        }
      })
      .then((data) => {
        if (data && data.error) {
           throw new Error(data.error);
        }
        if (Array.isArray(data)) {
          const formatted: Product[] = data.map(p => {
            const rawName = p.name || "Товар";
            const rawDesc = p.description || "";
            
            const cleanName = rawName.replace(/\[SALE\]/gi, "").trim();
            const cleanDesc = rawDesc.replace(/\[SALE\]/gi, "").trim();

            return {
                product_id: parseInt(p.product_id),
                name: cleanName,
                description: cleanDesc,
                long_description: p.long_description || "",
                image_url: p.image_url || p.image || "",
                price: parseFloat(p.sale_price || p.price || 0),
                original_price: parseFloat(p.original_price || 0),
                quantity: (p.quantity !== undefined && p.quantity !== null) ? parseInt(p.quantity) : null
            };
          });
          setProducts(formatted);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
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
    const existingIndex = currentCart.findIndex((item: any) => parseInt(item.product_id) === product.product_id);

    if (existingIndex !== -1) {
      currentCart[existingIndex].quantity = (Number(currentCart[existingIndex].quantity) || 0) + 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(currentCart));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("cart-updated"));

    const newToast: ToastMessage = {
      id: Date.now(),
      text: `✅ ${product.name} додано у кошик!`,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => removeToast(newToast.id), 3000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (loading) return (
    <div className={styles.sale}>
      <h1>🎉 Акції</h1>
      <div style={{marginTop: '60px', color: '#64748b', fontSize: '1.2rem'}}>Шукаємо знижки для вас...</div>
    </div>
  );
  
  if (error) return (
    <div className={styles.sale}>
        <h1>🎉 Акції</h1>
        <div style={{
            marginTop: '80px',
            padding: '60px 40px',
            background: 'white',
            borderRadius: '28px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            maxWidth: '600px',
            width: '90%',
            border: '1px solid #f1f5f9'
        }}>
            <div style={{fontSize: '4rem', marginBottom: '15px'}}>⚠️</div>
            <h2 style={{color: '#1e293b', fontSize: '1.6rem', margin: 0, fontWeight: 800}}>Помилка завантаження</h2>
            <p style={{color: '#64748b', marginTop: '10px'}}>{error}</p>
            <button onClick={() => window.location.reload()} style={{marginTop: '30px', padding: '12px 28px', background: '#1e293b', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, color: 'white'}}>🔄 Оновити</button>
        </div>
    </div>
  );

  return (
    <div className={styles.sale}>
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <div key={toast.id} className={styles.toast}>
            <span>{toast.text}</span>
            <button className={styles.closeBtn} onClick={() => removeToast(toast.id)}>✕</button>
          </div>
        ))}
      </div>

      <h1>🎉 Гарячі Акції</h1>
      <p>Найкращі ціни для ваших улюбленців! ❤️</p>

      {products.length === 0 ? (
        <div style={{marginTop: '40px', padding: '80px 40px', background: 'white', borderRadius: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '600px', width: '90%', border: '1px solid #f1f5f9'}}>
            <div style={{fontSize: '4.5rem', marginBottom: '20px'}}>😿</div>
            <h2 style={{color: '#1e293b', fontSize: '1.8rem', margin: 0, fontWeight: 800}}>Наразі акцій немає</h2>
            <button onClick={() => window.location.href = '/products'} style={{marginTop: '30px', padding: '14px 32px', background: '#22c55e', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, color: 'white', fontSize: '1rem'}}>🛍️ В каталог</button>
        </div>
      ) : (
        <div className={styles.saleGrid}>
          {products.map((product) => {
            const isInStock = product.quantity === null || product.quantity > 0;
            
            const discount = product.original_price > 0 
                ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                : 0;

            return (
              <div key={product.product_id} className={styles.saleCard}>
                <div className={styles.discountBadge}>
                    -{discount}%
                </div>
                <div className={styles.saleLabel}>
                    SALE
                </div>
                <img 
                    src={product.image_url && product.image_url.trim() !== "" ? product.image_url : "https://placehold.co/400x300?text=📦"} 
                    alt={product.name} 
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=📦" }}
                />
                <h3>{product.name}</h3>
                <p className={styles.desc}>{product.description}</p>
                
                <button className={styles.detailsBtnSale} onClick={() => setSelectedProduct(product)}>
                  Подробніше
                </button>

                <div className={styles.priceBlock}>
                  <span className={styles.oldPrice}>{product.original_price.toFixed(2)} ₴</span>
                  <span className={styles.discountedPrice}>{product.price.toFixed(2)} ₴</span>
                  <span className={`${styles.stockStatus} ${isInStock ? styles.inStock : styles.outOfStock}`}>
                    {isInStock ? '✅ В наявності' : '⏳ Очікується'}
                  </span>
                </div>
                <button className={styles.btn} onClick={() => addToCart(product)} disabled={!isInStock}>
                    {isInStock ? '🛒 У кошик' : 'Сповістити'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedProduct && (
        <div className={styles.detailsModalOverlay} onClick={() => setSelectedProduct(null)}>
          <div className={styles.detailsModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalImageGallery}>
              <img 
                src={selectedProduct.image_url && selectedProduct.image_url.trim() !== "" ? selectedProduct.image_url : "https://placehold.co/500x500?text=📦"} 
                alt={selectedProduct.name} 
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/500x500?text=📦" }}
              />
            </div>

            <div className={styles.modalContentList}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Назва:</span>
                <span className={styles.specValue}>{selectedProduct.name}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Акційна ціна:</span>
                <span className={styles.specValue}>{Number(selectedProduct.price).toFixed(2)} грн</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Стара ціна:</span>
                <span className={styles.specValue} style={{ textDecoration: 'line-through', color: '#8c8c8c' }}>{Number(selectedProduct.original_price).toFixed(2)} грн</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Наявність:</span>
                <span className={`spec-value ${(selectedProduct.quantity || 0) > 0 ? styles.stockPositive : styles.stockNegative}`}>
                  {(selectedProduct.quantity || 0) > 0 ? `${selectedProduct.quantity} шт.` : 'Немає в наявності'}
                </span>
              </div>
              <div className={styles.specItem} style={{ flexDirection: 'column', marginTop: '15px' }}>
                <span className={styles.specLabel} style={{ marginBottom: '8px' }}>Опис:</span>
                <span className={styles.descriptionText} style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedProduct.long_description || selectedProduct.description || "Інформація про товар уточнюється."}
                </span>
              </div>
            </div>

            <div className={styles.modalFooterActions}>
              {(selectedProduct.quantity || 0) > 0 && (
                <button className={styles.modalBuyBtn} onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                  Додати до кошика
                </button>
              )}
              <button className={styles.modalCloseBtn} onClick={() => setSelectedProduct(null)}>
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sale;
