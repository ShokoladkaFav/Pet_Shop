import React, { useState, useEffect, useMemo } from "react";
import "./WorkerDashboard_Sale.css";

interface SaleProduct {
  product_id: number;
  name: string;
  price: number; 
  original_price: number;
  description: string;
  image_url?: string;
}

interface WorkerDashboardSaleProps {
  authFetch: (url: string, options?: RequestInit) => Promise<any>;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  stock: any[];
}

const WorkerDashboardSale: React.FC<WorkerDashboardSaleProps> = ({ authFetch, addToast, stock }) => {
  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  
  const [searchInput, setSearchInput] = useState("");
  const [searchMode, setSearchMode] = useState<'name' | 'id'>('name');
  const [showResults, setShowResults] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);

  const discountPresets = [10, 20, 25, 30, 50];

  useEffect(() => {
    fetchSaleProducts();
  }, []);

  const fetchSaleProducts = async () => {
    setLoading(true);
    try {
      const data = await authFetch("http://localhost/zoo-api/Sale.php");
      if (data && Array.isArray(data)) {
          const formatted: SaleProduct[] = data.map(s => ({
            product_id: parseInt(s.product_id),
            name: s.name || "Без назви",
            price: parseFloat(s.sale_price || s.price || 0),
            original_price: parseFloat(s.original_price || 0),
            description: s.description || "",
            image_url: s.image_url || s.image || ""
          }));
          setSaleProducts(formatted);
      } else {
          setSaleProducts([]);
      }
    } catch (e) { 
        setSaleProducts([]);
        addToast('error', 'Не вдалося завантажити список акцій');
    } finally {
        setLoading(false);
    }
  };

  const filteredStock = useMemo(() => {
    if (!stock || !Array.isArray(stock)) return [];
    const saleIds = new Set(saleProducts.map(s => s.product_id));
    
    const availableItems = stock.filter(item => {
      const pId = parseInt(item.product_id);
      return !isNaN(pId) && !saleIds.has(pId);
    });
    
    const query = searchInput.toLowerCase().trim();
    if (query === "") return availableItems.slice(0, 5); 
    
    return availableItems.filter(item => {
      if (searchMode === 'name') {
        return (item.product_name || "").toLowerCase().includes(query);
      } else {
        return (item.product_id || "").toString().includes(query);
      }
    }).slice(0, 5);
  }, [stock, searchInput, searchMode, saleProducts]);

  const extractNumericValue = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const clean = val.toString().replace(',', '.').replace(/[^\d.]/g, '');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  const basePrice = useMemo(() => {
    if (!selectedProduct) return 0;
    return extractNumericValue(selectedProduct.price);
  }, [selectedProduct]);

  const calculatedSalePrice = useMemo(() => {
    const price = basePrice;
    if (price <= 0) return 0;
    const discount = price * (discountPercent / 100);
    const result = price - discount;
    return Math.max(0, parseFloat(result.toFixed(2)));
  }, [basePrice, discountPercent]);

  const resetForm = () => {
    setSelectedProduct(null);
    setSearchInput("");
    setDiscountPercent(20);
    setShowResults(false);
  };

  const selectItem = (item: any) => {
    setSelectedProduct(item);
    setSearchInput(item.product_name || "");
    setShowResults(false);
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
        addToast('error', 'Виберіть товар зі списку');
        return;
    }

    const productId = parseInt(selectedProduct.product_id);
    if (isNaN(productId)) {
        addToast('error', 'Помилка: Товар не має коректного Product ID');
        return;
    }

    if (basePrice <= 0) {
        addToast('error', 'У товару нульова ціна в базі');
        return;
    }
    
    setLoading(true);
    const payload = {
      product_id: productId,
      sale_price: calculatedSalePrice
    };

    try {
      const result = await authFetch(`http://localhost/zoo-api/add_sale.php`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      
      if (result && result.status === "success") {
        addToast('success', 'Акцію активовано!');
        setShowSaleModal(false);
        resetForm();
        fetchSaleProducts();
      } else {
        addToast('error', result.message || 'Помилка збереження');
      }
    } catch (e: any) {
        addToast('error', 'Сервер повернув помилку при створенні акції');
    } finally {
        setLoading(false);
    }
  };

  const performDeleteSale = async () => {
    if (!saleToDelete) return;
    try {
      const result = await authFetch("http://localhost/zoo-api/remove_sale.php", {
        method: "POST",
        body: JSON.stringify({ product_id: saleToDelete })
      });
      if (result && result.status === "success") {
          addToast('info', 'Знижку видалено');
          fetchSaleProducts();
      } else {
          addToast('error', result.message || 'Не вдалося видалити акцію');
      }
    } catch (e) {
        addToast('error', 'Помилка видалення');
    } finally { 
        setSaleToDelete(null); 
    }
  };

  // Хелпер для коректного URL картинки
  const getImageUrl = (url?: string) => {
    if (!url || url === "null" || url === "undefined" || url === "") {
        return "https://placehold.co/100x100?text=📦";
    }
    return url;
  };

  return (
    <div className="panel fade-in">
      <header className="sale-panel-header">
        <div>
            <h2 className="sale-title">🔥 Акційні Пропозиції</h2>
            <p className="sale-subtitle">Створюйте знижки для клієнтів</p>
        </div>
        <div className="sale-header-actions">
            <button className="btn-refresh-sale" style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', marginRight: '10px'}} onClick={fetchSaleProducts}>🔄</button>
            <button className="btn-create-sale" onClick={() => setShowSaleModal(true)}>
              ✨ Створити Акцію
            </button>
        </div>
      </header>
      
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Товар</th>
              <th>Стара ціна</th>
              <th>Нова ціна</th>
              <th>Знижка</th>
              <th style={{ textAlign: "right" }}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {saleProducts.length > 0 ? saleProducts.map(sale => {
              const diff = sale.original_price - sale.price;
              const percent = sale.original_price > 0 ? Math.round((diff / sale.original_price) * 100) : 0;
              return (
                <tr key={sale.product_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '45px', height: '45px', overflow: 'hidden', borderRadius: '10px', background: '#f1f5f9' }}>
                        <img 
                          src={getImageUrl(sale.image_url)} 
                          alt={sale.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/45x45?text=📦" }}
                        /> 
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ color: '#1e293b' }}>{sale.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Product ID: {sale.product_id}</span>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>{sale.original_price.toFixed(2)} ₴</span></td>
                  <td><span style={{ color: '#e11d48', fontWeight: 800 }}>{sale.price.toFixed(2)} ₴</span></td>
                  <td><span style={{ background: '#fff1f2', color: '#e11d48', padding: '4px 8px', borderRadius: '8px', fontWeight: 700 }}>-{percent}%</span></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="delete-icon-btn" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setSaleToDelete(sale.product_id)}>🗑️</button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  {loading ? "Отримання даних..." : "Активні акції відсутні."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showSaleModal && (
        <div className="modal-overlay-dash" onClick={() => setShowResults(false)}>
          <div className="modal-dash" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3>🎁 Створити акцію</h3>
                <button style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => {setShowSaleModal(false); resetForm();}}>✕</button>
            </div>
            
            <form onSubmit={handleSaleSubmit}>
                <div className="search-mode-selector">
                    <button type="button" className={searchMode === 'name' ? 'active' : ''} onClick={() => setSearchMode('name')}>Назва</button>
                    <button type="button" className={searchMode === 'id' ? 'active' : ''} onClick={() => setSearchMode('id')}>ID Товару</button>
                </div>

                <div className="search-wrapper-container" style={{ marginBottom: '20px' }}>
                    <input 
                      type="text" 
                      placeholder={searchMode === 'name' ? "Введіть назву (н-д: Корм...)" : "Введіть ID товару..."}
                      value={searchInput}
                      onFocus={() => setShowResults(true)}
                      onChange={(e) => {setSearchInput(e.target.value); setShowResults(true);}}
                      className="premium-input"
                    />
                    {showResults && (
                      <div className="search-dropdown-box">
                        {filteredStock.map(item => {
                          const itemPrice = extractNumericValue(item.price);
                          return (
                            <div key={item.inventory_id} className="dropdown-item-row" onClick={() => selectItem(item)}>
                              <img 
                                src={getImageUrl(item.image_url)} 
                                alt="" 
                                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/44x44?text=📦" }}
                              />
                              <div style={{ textAlign: 'left' }}>
                                  <span className="item-name">{item.product_name}</span>
                                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Ціна: {itemPrice.toFixed(2)} ₴ | ID: {item.product_id}</span>
                              </div>
                            </div>
                          );
                        })}
                        {filteredStock.length === 0 && <div className="dropdown-empty">Товарів не знайдено (або вони вже в акціях)</div>}
                      </div>
                    )}
                </div>

                <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                    <label className="section-label">Розмір знижки (%)</label>
                    <div className="discount-presets-grid">
                        {discountPresets.map(val => (
                            <button 
                                key={val} 
                                type="button" 
                                className={`preset-btn ${discountPercent === val ? 'active' : ''}`}
                                onClick={() => setDiscountPercent(val)}
                            >
                                {val}%
                            </button>
                        ))}
                    </div>
                </div>

                {selectedProduct && (
                    <div className="luxury-price-preview-card animate-slide-in">
                        <div className="preview-header">
                            <img 
                              src={getImageUrl(selectedProduct.image_url)} 
                              alt="" 
                              onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/50x50?text=📦" }}
                            />
                            <div className="preview-titles">
                                <strong>{selectedProduct.product_name}</strong>
                                <span>Початкова ціна: {basePrice.toFixed(2)} ₴</span>
                            </div>
                        </div>
                        <div className="price-comparison">
                            <div className="price-item old">
                                <small>БУЛО</small>
                                <span>{basePrice.toFixed(2)} ₴</span>
                            </div>
                            <div className="price-arrow">→</div>
                            <div className="price-item new">
                                <small>БУДЕ</small>
                                <span>{calculatedSalePrice.toFixed(2)} ₴</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="modal-actions-dash">
                  <button type="submit" className="save-btn-dash" disabled={!selectedProduct || basePrice <= 0 || loading} style={{ width: '100%' }}>
                      {loading ? '⏳ Обробка...' : (selectedProduct && basePrice <= 0) ? '❌ Немає ціни в БД' : '🚀 Активувати знижку'}
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {saleToDelete !== null && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3>Видалити акцію?</h3>
            <p>Ціна товару повернеться до початкового значення ({saleProducts.find(s => s.product_id === saleToDelete)?.original_price.toFixed(2)} ₴).</p>
            <div className="confirm-actions">
              <button className="btn-confirm-cancel" onClick={() => setSaleToDelete(null)}>Скасувати</button>
              <button className="btn-confirm-delete" onClick={performDeleteSale}>Так, видалити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboardSale;