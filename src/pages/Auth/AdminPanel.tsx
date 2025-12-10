import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

// 🔄 ОНОВЛЕНО: Інтерфейс відповідає Doctrine Entity 'Employee'
interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  work_email: string;
  position: string;
}

// 🔄 ОНОВЛЕНО: Інтерфейс відповідає Doctrine Entity 'Supplier'
interface Supplier {
  supplier_id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

// 🔄 ОНОВЛЕНО: Інтерфейс для Товарів (поля збігаються з getProducts.php + add_product.php)
interface Product {
  product_id?: number;
  name: string;
  category: string;
  price: string;
  description: string;
  supplier_id: string | number; // Може бути int з БД або string з форми
  image_url: string;   
  quantity?: string;   // Для Inventory (add_product.php обробляє це)
  location?: string;   // Для Inventory
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("suppliers");
  
  // === STATE ===
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]); 
  const [products, setProducts] = useState<Product[]>([]); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false); 
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    category: "cats", 
    price: "",
    description: "",
    supplier_id: "",
    image_url: "",
    quantity: "", 
    location: "Склад-A1" 
  });

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);
  const [selectedEmpName, setSelectedEmpName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Supplier Modal State
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier>({
    supplier_id: 0,
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: ""
  });

  // 🔑 Helper to get token
  const getToken = () => sessionStorage.getItem("employee_token");

  useEffect(() => {
    const empStr = sessionStorage.getItem("employee");
    if (!empStr) {
      navigate("/employee-login");
      return;
    }
    const employee = JSON.parse(empStr);
    
    // Перевірка прав (допускаємо адмінів та менеджерів до цієї панелі, хоча можна обмежити суворіше)
    const allowedRoles = ["Адмін", "admin", "Менеджер", "manager"];
    if (!allowedRoles.includes(employee.position) && employee.role !== "admin") {
      alert("Доступ до панелі керування обмежено.");
      navigate("/worker-dashboard");
    }

    fetchEmployees();
    fetchSuppliers();
    fetchProducts(); 

  }, [navigate]);

  // --- API CALLS (Doctrine Backend) ---

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost/zoo-api/get_employees.php");
      if (!res.ok) throw new Error("Помилка завантаження працівників");
      const data = await res.json();
      if (Array.isArray(data)) setEmployees(data);
    } catch (error: any) {
      console.error(error);
    }
  };

  const fetchSuppliers = async () => {
    setError(null);
    try {
      const res = await fetch("http://localhost/zoo-api/get_suppliers.php");
      if (!res.ok) throw new Error("Помилка завантаження постачальників");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuppliers(data);
      } else {
        console.error("Невірний формат даних:", data);
        if (data.error) setError(`Помилка сервера: ${data.error}`);
      }
    } catch (error: any) {
      console.error(error);
      setError("❌ Не вдалося завантажити постачальників.");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost/zoo-api/getProducts.php");
      if (!res.ok) throw new Error("Помилка завантаження товарів");
      const data = await res.json();
      if (Array.isArray(data)) {
          setProducts(data);
      } else if (data.error) {
          console.error("API Error:", data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- HELPERS ---
  const getSupplierName = (id: string | number) => {
    const numId = Number(id);
    const sup = suppliers.find(s => s.supplier_id === numId);
    return sup ? sup.name : `ID: ${id}`;
  };

  // --- HANDLERS FOR SUPPLIERS ---

  const handleOpenAddSupplier = () => {
    setIsEditingSupplier(false);
    setCurrentSupplier({ supplier_id: 0, name: "", contact_person: "", phone: "", email: "", address: "" });
    setShowSupplierModal(true);
  };

  const handleOpenEditSupplier = (supplier: Supplier) => {
    setIsEditingSupplier(true);
    setCurrentSupplier(supplier);
    setShowSupplierModal(true);
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цього постачальника?")) return;

    try {
      const res = await fetch("http://localhost/zoo-api/manage_suppliers.php", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ action: "delete", supplier_id: id })
      });
      const result = await res.json();
      if (result.status === "success") {
        fetchSuppliers(); 
      } else {
        alert("Помилка: " + result.message);
      }
    } catch (e) {
      alert("Помилка з'єднання");
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = isEditingSupplier ? "update" : "create";
    
    try {
      const res = await fetch("http://localhost/zoo-api/manage_suppliers.php", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ action, ...currentSupplier })
      });
      const result = await res.json();
      
      if (result.status === "success") {
        alert(isEditingSupplier ? "Дані оновлено!" : "Постачальника додано!");
        setShowSupplierModal(false);
        fetchSuppliers(); 
      } else {
        alert("Помилка: " + result.message);
      }
    } catch (e) {
      alert("Помилка з'єднання: Перевірте manage_suppliers.php");
    }
  };

  // --- HANDLERS FOR PRODUCTS ---

  const handleOpenAddProduct = () => {
    setNewProduct({
      name: "",
      category: "cats", 
      price: "",
      description: "",
      supplier_id: "",
      image_url: "",
      quantity: "", 
      location: "Склад-A1" 
    });
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.supplier_id) {
        alert("⚠️ Будь ласка, оберіть постачальника зі списку!");
        return;
    }
    
    if (!newProduct.quantity || parseInt(newProduct.quantity) < 0) {
        alert("⚠️ Вкажіть коректну кількість товару!");
        return;
    }

    try {
        const response = await fetch("http://localhost/zoo-api/add_product.php", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify(newProduct)
        });
        
        const result = await response.json();

        if (result.status === "success") {
            alert(`✅ Товар "${newProduct.name}" успішно додано!`);
            setShowProductModal(false);
            fetchProducts(); 
        } else {
            alert("❌ Помилка при додаванні: " + result.message);
        }
    } catch (error) {
        console.error(error);
        alert("❌ Помилка з'єднання з сервером.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Ви дійсно хочете видалити цей товар?")) return;

    try {
        const response = await fetch("http://localhost/zoo-api/delete_product.php", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({ product_id: id })
        });
        
        const result = await response.json();

        if (result.status === "success") {
            alert("🗑️ Товар видалено.");
            fetchProducts(); 
        } else {
            alert("❌ Помилка: " + result.message);
        }
    } catch (error) {
        alert("❌ Помилка з'єднання.");
    }
  };

  // --- HANDLERS FOR EMPLOYEES ---

  const openPasswordModal = (emp: Employee) => {
    setSelectedEmpId(emp.employee_id);
    setSelectedEmpName(`${emp.first_name} ${emp.last_name}`);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (!newPassword || !selectedEmpId) return;

    try {
      const response = await fetch("http://localhost/zoo-api/admin_update_password.php", {
         method: "POST",
         headers: { 
           "Content-Type": "application/json",
           "Authorization": `Bearer ${getToken()}`
         },
         body: JSON.stringify({ 
           id: selectedEmpId, 
           password: newPassword 
         })
      });

      const result = await response.json();
      if (result.status === "success") {
        alert(`✅ Пароль для ${selectedEmpName} успішно оновлено!`);
        setShowPasswordModal(false);
      } else {
        alert(`❌ Помилка: ${result.message}`);
      }
    } catch (error) {
      alert("❌ Помилка з'єднання з сервером");
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!window.confirm("Ви дійсно хочете видалити (звільнити) цього працівника?")) return;

    try {
        const response = await fetch("http://localhost/zoo-api/delete_employee.php", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({ employee_id: id })
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("✅ Працівника видалено.");
            fetchEmployees(); 
        } else {
            alert("❌ Помилка: " + result.message);
        }
    } catch (error) {
        alert("❌ Помилка з'єднання.");
    }
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-header">
          <h2>🛠️ Адмін Панель</h2>
          <p>Global System Control</p>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={activeTab === "suppliers" ? "active" : ""} 
            onClick={() => setActiveTab("suppliers")}
          >
            🚚 Постачальники
          </button>
          <button 
            className={activeTab === "employees" ? "active" : ""} 
            onClick={() => setActiveTab("employees")}
          >
            👔 Персонал
          </button>
          <button 
            className={activeTab === "products" ? "active" : ""} 
            onClick={() => setActiveTab("products")}
          >
            📦 Товари (Каталог)
          </button>
        </nav>

        <button className="back-dashboard-btn" onClick={() => navigate("/worker-dashboard")}>
          ⬅ Назад до Dashboard
        </button>
      </aside>

      {/* CONTENT */}
      <main className="admin-content">
        
        {/* === SUPPLIERS TAB === */}
        {activeTab === "suppliers" && (
          <div className="admin-panel-card">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                <h1 style={{marginBottom: 0}}>🚚 Постачальники</h1>
                <button className="btn-submit" style={{width: "auto", padding: "10px 20px"}} onClick={handleOpenAddSupplier}>
                    ➕ Додати постачальника
                </button>
            </div>
            
            <p>База даних партнерів та постачальників зоотоварів.</p>

            {error && (
              <div style={{backgroundColor: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "5px", marginBottom: "20px", border: "1px solid #f5c6cb"}}>
                {error}
              </div>
            )}
            
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Компанія</th>
                  <th>Контактна особа</th>
                  <th>Телефон</th>
                  <th>Email</th>
                  <th>Адреса</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(sup => (
                  <tr key={sup.supplier_id}>
                    <td><strong>{sup.name}</strong></td>
                    <td>{sup.contact_person}</td>
                    <td>{sup.phone}</td>
                    <td>{sup.email}</td>
                    <td>{sup.address}</td>
                    <td>
                      <button className="action-btn btn-edit" onClick={() => handleOpenEditSupplier(sup)} style={{backgroundColor: "#ffc107", color: "#000"}}>
                        ✏️
                      </button>
                      <button className="action-btn btn-delete" onClick={() => handleDeleteSupplier(sup.supplier_id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {!error && suppliers.length === 0 && <tr><td colSpan={6}>Постачальників не знайдено 📦</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* === EMPLOYEES TAB === */}
        {activeTab === "employees" && (
          <div className="admin-panel-card">
            <h1>👔 Управління Персоналом</h1>
            <p>Список працівників з бази даних.</p>
            
            {loading && <p>🔄 Завантаження списку...</p>}
            
            {!loading && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ПІБ</th>
                    <th>Email (Логін)</th>
                    <th>Посада</th>
                    <th>Пароль</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.employee_id}>
                      <td>{emp.employee_id}</td>
                      <td><strong>{emp.first_name} {emp.last_name}</strong></td>
                      <td>{emp.work_email}</td>
                      <td>
                        <span className="role-badge manager" style={{background: '#6c757d', color: '#fff'}}>
                          {emp.position}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="action-btn btn-password"
                          onClick={() => openPasswordModal(emp)}
                        >
                          🔑 Змінити пароль
                        </button>
                      </td>
                      <td>
                        <button 
                          className="action-btn btn-delete"
                          onClick={() => handleDeleteEmployee(emp.employee_id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* === PRODUCTS TAB === */}
        {activeTab === "products" && (
          <div className="admin-panel-card">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                <h1 style={{marginBottom: 0}}>📦 Товари</h1>
                <button className="btn-submit" style={{width: "auto", padding: "10px 20px"}} onClick={handleOpenAddProduct}>
                    ➕ Додати товар
                </button>
            </div>
            <p>Керування каталогом товарів. При додаванні товару він автоматично потрапляє на склад.</p>
            
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Фото</th>
                  <th>Назва</th>
                  <th>Категорія</th>
                  <th>Ціна</th>
                  <th>Постачальник</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {products.map(prod => (
                  <tr key={prod.product_id}>
                    <td>{prod.product_id}</td>
                    <td>
                        {prod.image_url ? 
                            <img src={prod.image_url} alt="img" style={{width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px"}} /> 
                            : "❌"
                        }
                    </td>
                    <td><strong>{prod.name}</strong></td>
                    <td>{prod.category}</td>
                    <td>{prod.price} ₴</td>
                    {/* Тут використовуємо helper для виводу імені */}
                    <td>{getSupplierName(prod.supplier_id)}</td>
                    <td>
                      <button className="action-btn btn-delete" onClick={() => handleDeleteProduct(prod.product_id!)}>
                        🗑️ Видалити
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={7}>Товарів немає. Додайте перший! 📦</td></tr>}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* === MODAL FOR PASSWORD CHANGE === */}
      {showPasswordModal && (
        <div className="modal-overlay-admin">
          <div className="modal-admin">
            <h3>🔐 Зміна пароля</h3>
            <p>Новий пароль для: <strong>{selectedEmpName}</strong></p>
            <input 
              type="text" 
              placeholder="Введіть новий пароль" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="password-input"
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>Скасувати</button>
              <button className="save-btn" onClick={handleSavePassword}>Зберегти</button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL FOR SUPPLIER (ADD/EDIT) === */}
      {showSupplierModal && (
        <div className="modal-overlay-admin">
          <div className="modal-admin">
            <h3>{isEditingSupplier ? "✏️ Редагувати" : "➕ Додати"} постачальника</h3>
            <form onSubmit={handleSaveSupplier}>
                <div className="form-group">
                    <label>Назва компанії:</label>
                    <input type="text" required value={currentSupplier.name} onChange={e => setCurrentSupplier({...currentSupplier, name: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Контактна особа:</label>
                    <input type="text" value={currentSupplier.contact_person} onChange={e => setCurrentSupplier({...currentSupplier, contact_person: e.target.value})} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Телефон:</label>
                        <input type="text" value={currentSupplier.phone} onChange={e => setCurrentSupplier({...currentSupplier, phone: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" value={currentSupplier.email} onChange={e => setCurrentSupplier({...currentSupplier, email: e.target.value})} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Адреса:</label>
                    <input type="text" value={currentSupplier.address} onChange={e => setCurrentSupplier({...currentSupplier, address: e.target.value})} />
                </div>
                <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowSupplierModal(false)}>Скасувати</button>
                    <button type="submit" className="save-btn">Зберегти</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL FOR ADDING PRODUCT (NEW) === */}
      {showProductModal && (
        <div className="modal-overlay-admin">
          <div className="modal-admin" style={{maxWidth: "550px"}}>
             <h3>📦 Додати новий товар</h3>
             <form onSubmit={handleProductSubmit}>
                  <div className="form-group">
                    <label>Назва товару:</label>
                    <input 
                      type="text" required 
                      placeholder="Наприклад: Корм для котів Whiskas"
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-row">
                      <div className="form-group">
                        <label>Категорія:</label>
                        <select 
                          value={newProduct.category}
                          onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                          style={{fontWeight: "bold", color: "#2c3e50"}}
                        >
                          <option value="cats">🐱 Коти</option>
                          <option value="dogs">🐶 Собаки</option>
                          <option value="birds">🐦 Птахи</option>
                          <option value="fish">🐠 Риби</option>
                          <option value="Обладнання">⚙️ Обладнання (Акваріуми)</option>
                          <option value="sale">🔥 Акції</option>
                          <option value="vet">🩺 Ветеринарія</option>
                          <option value="other">📦 Інше</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Ціна (грн):</label>
                        <input 
                          type="number" step="0.01" required 
                          placeholder="0.00"
                          value={newProduct.price}
                          onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                        />
                      </div>
                  </div>

                  <div className="form-group">
                    <label>Постачальник:</label>
                    <select 
                      required
                      value={newProduct.supplier_id}
                      onChange={e => setNewProduct({...newProduct, supplier_id: e.target.value})}
                    >
                      <option value="">-- Оберіть зі списку --</option>
                      {suppliers.map(sup => (
                          <option key={sup.supplier_id} value={sup.supplier_id}>
                              {sup.name} (Код: {sup.supplier_id})
                          </option>
                      ))}
                    </select>
                  </div>

                  {/* 🆕 Секція для інвентаризації */}
                  <div className="form-row">
                      <div className="form-group">
                        <label>Кількість (шт):</label>
                        <input 
                          type="number" min="0" required 
                          placeholder="100"
                          value={newProduct.quantity}
                          onChange={e => setNewProduct({...newProduct, quantity: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Склад (Локація):</label>
                        <input 
                          type="text" required 
                          placeholder="Склад-A1"
                          value={newProduct.location}
                          onChange={e => setNewProduct({...newProduct, location: e.target.value})}
                        />
                      </div>
                  </div>

                  <div className="form-group">
                    <label>URL фото товару:</label>
                    <input 
                      type="text" placeholder="https://..."
                      value={newProduct.image_url}
                      onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Опис товару (Включайте ключові слова для пошуку):</label>
                    <textarea 
                      required
                      placeholder="Опишіть товар..."
                      value={newProduct.description}
                      onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                      style={{height: "80px"}}
                    ></textarea>
                  </div>

                  <div className="modal-actions">
                      <button type="button" className="cancel-btn" onClick={() => setShowProductModal(false)}>Скасувати</button>
                      <button type="submit" className="save-btn">Зберегти</button>
                  </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;