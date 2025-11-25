import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

// 🔄 ОНОВЛЕНО: Інтерфейс відповідає вашій таблиці employees
interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  work_email: string;
  position: string;
}

// 🆕 НОВИЙ: Інтерфейс для постачальників
interface Supplier {
  supplier_id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

interface Product {
  product_id?: number;
  name: string;
  category: string;
  price: string;
  description: string;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("suppliers");
  
  // === STATE ===
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]); // 🆕 State для постачальників
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Product Form State
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    category: "cats",
    price: "",
    description: ""
  });

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);
  const [selectedEmpName, setSelectedEmpName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Supplier Modal State 🆕
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

  useEffect(() => {
    // 🛡️ Перевірка прав доступу
    const empStr = sessionStorage.getItem("employee");
    if (!empStr) {
      navigate("/employee-login");
      return;
    }
    const employee = JSON.parse(empStr);
    
    // Перевірка на адміна
    if (employee.role !== "admin" && employee.position !== "Адмін") {
      alert("Доступ заборонено! Тільки для адміністраторів.");
      navigate("/worker-dashboard");
    }

    // Завантаження даних
    fetchEmployees();
    fetchSuppliers();

  }, [navigate]);

  // --- API CALLS ---

  const fetchEmployees = async () => {
    // Не скидаємо loading глобально, щоб не блимало все
    try {
      const res = await fetch("http://localhost/zoo-api/get_employees.php");
      if (!res.ok) throw new Error("Помилка завантаження працівників");
      const data = await res.json();
      if (Array.isArray(data)) setEmployees(data);
    } catch (error: any) {
      console.error(error);
      // Не блокуємо інтерфейс помилкою працівників, якщо ми на вкладці постачальників
    }
  };

  const fetchSuppliers = async () => {
    setError(null);
    try {
      const res = await fetch("http://localhost/zoo-api/get_suppliers.php");
      if (!res.ok) throw new Error("Помилка завантаження постачальників (CORS або 404)");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuppliers(data);
      } else {
        throw new Error("Невірний формат даних від сервера");
      }
    } catch (error: any) {
      console.error(error);
      setError("❌ Не вдалося завантажити постачальників. Перевірте, чи створено файл get_suppliers.php у папці api.");
    }
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", supplier_id: id })
      });
      const result = await res.json();
      if (result.status === "success") {
        fetchSuppliers(); // Оновити список
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
        headers: { "Content-Type": "application/json" },
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

  // --- HANDLERS FOR EMPLOYEES ---

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Товар "${newProduct.name}" додано! (Simulated)`);
    setNewProduct({ name: "", category: "cats", price: "", description: "" });
  };

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
         headers: { "Content-Type": "application/json" },
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
            👔 Персонал (БД)
          </button>
          <button 
            className={activeTab === "products" ? "active" : ""} 
            onClick={() => setActiveTab("products")}
          >
            📦 Додати товар
          </button>
          <button 
            className={activeTab === "settings" ? "active" : ""} 
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Налаштування
          </button>
        </nav>

        <button className="back-dashboard-btn" onClick={() => navigate("/worker-dashboard")}>
          ⬅ Назад до Dashboard
        </button>
      </aside>

      {/* CONTENT */}
      <main className="admin-content">
        
        {/* === SUPPLIERS TAB (REPLACES USERS) === */}
        {activeTab === "suppliers" && (
          <div className="admin-panel-card">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                <h1 style={{marginBottom: 0}}>🚚 Постачальники</h1>
                <button className="btn-submit" style={{width: "auto", padding: "10px 20px"}} onClick={handleOpenAddSupplier}>
                    ➕ Додати постачальника
                </button>
            </div>
            
            <p>База даних партнерів та постачальників зоотоварів.</p>

            {/* Вивід помилки, якщо PHP файли не налаштовані */}
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
            <p>Список працівників з бази даних. Ви можете встановити їм паролі.</p>
            
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
            <h1>📦 Додати новий товар</h1>
            <form onSubmit={handleProductSubmit} className="product-form-container">
              <div className="left-col">
                <div className="form-group">
                  <label>Назва товару:</label>
                  <input 
                    type="text" 
                    required 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Категорія:</label>
                  <select 
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="cats">Коти</option>
                    <option value="dogs">Собаки</option>
                    <option value="birds">Птахи</option>
                    <option value="fish">Риби</option>
                    <option value="sale">Акції</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ціна (грн):</label>
                  <input 
                    type="number" 
                    required 
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
              </div>
              <div className="right-col">
                <div className="form-group">
                  <label>Опис товару:</label>
                  <textarea 
                    required
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  ></textarea>
                </div>
                <button type="submit" className="btn-submit">💾 Зберегти товар</button>
              </div>
            </form>
          </div>
        )}

        {/* === SETTINGS TAB === */}
        {activeTab === "settings" && (
          <div className="admin-panel-card">
            <h1>⚙️ Налаштування</h1>
            <p>Глобальні параметри сайту.</p>
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
          <div className="modal-admin" style={{width: "500px", textAlign: "left"}}>
            <h3 style={{textAlign: "center"}}>{isEditingSupplier ? "✏️ Редагувати" : "➕ Додати"} постачальника</h3>
            
            <form onSubmit={handleSaveSupplier}>
                <div className="form-group">
                    <label>Назва компанії:</label>
                    <input 
                        type="text" required 
                        value={currentSupplier.name}
                        onChange={e => setCurrentSupplier({...currentSupplier, name: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Контактна особа:</label>
                    <input 
                        type="text" 
                        value={currentSupplier.contact_person}
                        onChange={e => setCurrentSupplier({...currentSupplier, contact_person: e.target.value})}
                    />
                </div>
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px"}}>
                    <div className="form-group">
                        <label>Телефон:</label>
                        <input 
                            type="text" 
                            value={currentSupplier.phone}
                            onChange={e => setCurrentSupplier({...currentSupplier, phone: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input 
                            type="email" 
                            value={currentSupplier.email}
                            onChange={e => setCurrentSupplier({...currentSupplier, email: e.target.value})}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Адреса:</label>
                    <input 
                        type="text" 
                        value={currentSupplier.address}
                        onChange={e => setCurrentSupplier({...currentSupplier, address: e.target.value})}
                    />
                </div>

                <div className="modal-actions" style={{marginTop: "20px"}}>
                    <button type="button" className="cancel-btn" onClick={() => setShowSupplierModal(false)}>Скасувати</button>
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