
import React, { useEffect, useState, useMemo } from "react";
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

// 🔄 ОНОВЛЕНО: Інтерфейс для Товарів
interface Product {
  product_id?: number;
  name: string;
  category: string;
  price: string | number;
  description: string;
  long_description: string; // Нове поле
  supplier_id: string | number;
  image_url: string;   
  quantity?: string | number;   
  location?: string;   
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

  // === Employee Filters State ===
  const [empFilters, setEmpFilters] = useState({
    id: "",
    name: "",
    email: "",
    position: "all"
  });

  // === Product Filters State ===
  const [prodFilters, setProdFilters] = useState({
    id: "",
    name: "",
    category: "all",
    supplier: "all"
  });

  // === Sort State ===
  const [empSortConfig, setEmpSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'employee_id',
    direction: 'asc'
  });

  const [prodSortConfig, setProdSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'product_id',
    direction: 'asc'
  });
  
  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false); 
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Product>({
    name: "",
    category: "cats", 
    price: "",
    description: "",
    long_description: "", // Нове поле
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
    
    const allowedRoles = ["Адмін", "admin", "Менеджер", "manager"];
    if (!allowedRoles.includes(employee.position) && employee.role !== "admin") {
      alert("Доступ до панелі керування обмежено.");
      navigate("/worker-dashboard");
    }

    fetchEmployees();
    fetchSuppliers();
    fetchProducts(); 

  }, [navigate]);

  // --- API CALLS ---

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
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("employee");
    sessionStorage.removeItem("employee_token");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  // --- FILTER & SORT LOGIC (EMPLOYEES) ---
  const uniquePositions = useMemo(() => {
    const positions = new Set(employees.map(e => e.position).filter(Boolean));
    return Array.from(positions).sort();
  }, [employees]);

  const handleEmpSort = (key: string) => {
    setEmpSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const processedEmployees = useMemo(() => {
    let result = employees.filter(emp => {
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      const matchId = emp.employee_id.toString().includes(empFilters.id);
      const matchName = fullName.includes(empFilters.name.toLowerCase());
      const matchEmail = emp.work_email.toLowerCase().includes(empFilters.email.toLowerCase());
      const matchPos = empFilters.position === "all" || emp.position === empFilters.position;
      return matchId && matchName && matchEmail && matchPos;
    });

    result.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        if (empSortConfig.key === 'name') {
            aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
            bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
        } else {
            aValue = a[empSortConfig.key as keyof Employee];
            bValue = b[empSortConfig.key as keyof Employee];
        }
        if (aValue === bValue) return 0;
        if (aValue < bValue) return empSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return empSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
    return result;
  }, [employees, empFilters, empSortConfig]);

  // --- FILTER & SORT LOGIC (PRODUCTS) ---
  const uniqueProductCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  const handleProdSort = (key: string) => {
    setProdSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const processedProducts = useMemo(() => {
    // 1. Filtering
    let result = products.filter(p => {
      const matchId = p.product_id?.toString().includes(prodFilters.id);
      const matchName = p.name.toLowerCase().includes(prodFilters.name.toLowerCase());
      const matchCat = prodFilters.category === "all" || p.category === prodFilters.category;
      const matchSup = prodFilters.supplier === "all" || p.supplier_id?.toString() === prodFilters.supplier;
      return matchId && matchName && matchCat && matchSup;
    });

    // 2. Sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (prodSortConfig.key === 'price') {
        aValue = Number(a.price);
        bValue = Number(b.price);
      } else {
        aValue = a[prodSortConfig.key as keyof Product];
        bValue = b[prodSortConfig.key as keyof Product];
      }

      if (aValue === bValue) return 0;
      if (aValue < bValue) return prodSortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return prodSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, prodFilters, prodSortConfig]);

  // --- HELPERS ---
  const getSupplierName = (id: string | number) => {
    const numId = Number(id);
    const sup = suppliers.find(s => s.supplier_id === numId);
    return sup ? sup.name : `ID: ${id}`;
  };

  // --- HANDLERS ---
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
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
        body: JSON.stringify({ action: "delete", supplier_id: id })
      });
      
      const text = await res.text();
      let result;
      try { result = JSON.parse(text); } catch (e) { throw new Error("Сервер повернув помилку (не JSON)"); }

      if (result.status === "success") fetchSuppliers();
      else alert("Помилка: " + result.message);
    } catch (e: any) { alert("❌ Помилка з'єднання: " + e.message); }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = isEditingSupplier ? "update" : "create";
    try {
      const res = await fetch("http://localhost/zoo-api/manage_suppliers.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
        body: JSON.stringify({ action, ...currentSupplier })
      });
      const result = await res.json();
      if (result.status === "success") {
        alert(isEditingSupplier ? "Дані оновлено!" : "Постачальника додано!");
        setShowSupplierModal(false);
        fetchSuppliers(); 
      } else alert("Помилка: " + result.message);
    } catch (e) { alert("Помилка з'єднання"); }
  };

  // --- PRODUCT HANDLERS ---
  const handleOpenAddProduct = () => {
    setIsEditingProduct(false);
    setNewProduct({ 
      name: "", 
      category: "cats", 
      price: "", 
      description: "", 
      long_description: "",
      supplier_id: "", 
      image_url: "", 
      quantity: "", 
      location: "Склад-A1" 
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setIsEditingProduct(true);
    setNewProduct({
      product_id: product.product_id,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      long_description: product.long_description || "",
      supplier_id: product.supplier_id,
      image_url: product.image_url || "",
      quantity: product.quantity || "",
      location: product.location || "Склад-A1"
    });
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.supplier_id) { alert("⚠️ Оберіть постачальника!"); return; }
    
    // Визначаємо ендпоінт залежно від режиму
    const endpoint = isEditingProduct 
      ? "http://localhost/zoo-api/update_product.php" 
      : "http://localhost/zoo-api/add_product.php";

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
            body: JSON.stringify(newProduct)
        });
        const result = await response.json();
        if (result.status === "success") {
            alert(isEditingProduct ? "✅ Товар оновлено!" : "✅ Товар додано!");
            setShowProductModal(false);
            fetchProducts(); 
        } else alert("❌ Помилка: " + result.message);
    } catch (error) { alert("❌ Помилка з'єднання."); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Ви дійсно хочете видалити цей товар?")) return;
    try {
        const token = getToken();
        const response = await fetch("http://localhost/zoo-api/delete_product.php", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": token ? `Bearer ${token}` : "" 
            },
            body: JSON.stringify({ product_id: id })
        });

        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error("Non-JSON response:", text);
            throw new Error("Невірна відповідь сервера (не JSON).");
        }

        if (result.status === "success") { 
            alert("🗑️ Товар видалено."); 
            fetchProducts(); 
        } else {
            alert("❌ Помилка: " + (result.message || "Невідома помилка"));
        }
    } catch (error: any) { 
        console.error("Delete product error:", error);
        alert("❌ Помилка: " + error.message); 
    }
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
         headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
         body: JSON.stringify({ id: selectedEmpId, password: newPassword })
      });
      const result = await response.json();
      if (result.status === "success") {
        alert(`✅ Пароль оновлено!`);
        setShowPasswordModal(false);
      } else alert(`❌ Помилка: ${result.message}`);
    } catch (error) { alert("❌ Помилка з'єднання"); }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!window.confirm("Ви дійсно хочете видалити цього працівника?")) return;
    try {
        const token = getToken();
        const response = await fetch("http://localhost/zoo-api/delete_employee.php", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": token ? `Bearer ${token}` : "" 
            },
            body: JSON.stringify({ employee_id: id })
        });

        const text = await response.text();
        let result;
        try { result = JSON.parse(text); } catch (e) { throw new Error("Сервер повернув невірний формат даних."); }

        if (result.status === "success") { 
            alert("✅ Працівника видалено."); 
            fetchEmployees(); 
        } else {
            alert("❌ Помилка: " + result.message);
        }
    } catch (error: any) { 
        alert("❌ Помилка з'єднання: " + error.message); 
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
          <button className={activeTab === "suppliers" ? "active" : ""} onClick={() => setActiveTab("suppliers")}>🚚 Постачальники</button>
          <button className={activeTab === "employees" ? "active" : ""} onClick={() => setActiveTab("employees")}>👔 Персонал</button>
          <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}>📦 Товари (Каталог)</button>
        </nav>

        <div className="admin-sidebar-footer">
            <button className="back-dashboard-btn" onClick={() => navigate("/worker-dashboard")}>⬅ Назад до Dashboard</button>
            <button className="admin-logout-btn" onClick={handleLogout}>🚪 Вийти</button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="admin-content">
        {activeTab === "suppliers" && (
          <div className="admin-panel-card">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                <h1 style={{marginBottom: 0}}>🚚 Постачальники</h1>
                <button className="btn-submit" style={{width: "auto", padding: "10px 20px"}} onClick={handleOpenAddSupplier}>➕ Додати постачальника</button>
            </div>
            {error && <div style={{backgroundColor: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "5px", marginBottom: "20px"}}>{error}</div>}
            <table className="admin-table">
              <thead>
                <tr><th>Компанія</th><th>Контактна особа</th><th>Телефон</th><th>Email</th><th>Адреса</th><th>Дії</th></tr>
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
                      <button className="action-btn btn-edit" onClick={() => handleOpenEditSupplier(sup)}>✏️</button>
                      <button className="action-btn btn-delete" onClick={() => handleDeleteSupplier(sup.supplier_id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "employees" && (
          <div className="admin-panel-card">
            <h1>👔 Управління Персоналом</h1>
            
            <div className="admin-filters-bar">
                <input 
                  type="text" 
                  placeholder="🔍 ID" 
                  value={empFilters.id} 
                  onChange={e => setEmpFilters({...empFilters, id: e.target.value})}
                  className="filter-input-compact"
                />
                <input 
                  type="text" 
                  placeholder="👤 Пошук за ПІБ..." 
                  value={empFilters.name} 
                  onChange={e => setEmpFilters({...empFilters, name: e.target.value})}
                  className="filter-input-compact"
                />
                <input 
                  type="text" 
                  placeholder="📧 Email працівника..." 
                  value={empFilters.email} 
                  onChange={e => setEmpFilters({...empFilters, email: e.target.value})}
                  className="filter-input-compact"
                />
                <select 
                  value={empFilters.position} 
                  onChange={e => setEmpFilters({...empFilters, position: e.target.value})}
                  className="filter-select-compact"
                >
                    <option value="all">📂 Усі посади</option>
                    {uniquePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th onClick={() => handleEmpSort('employee_id')} className="sortable-header">
                    ID {empSortConfig.key === 'employee_id' ? (empSortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleEmpSort('name')} className="sortable-header">
                    ПІБ {empSortConfig.key === 'name' ? (empSortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th>Email</th>
                  <th>Посада</th>
                  <th>Пароль</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {processedEmployees.map(emp => (
                  <tr key={emp.employee_id}>
                    <td>{emp.employee_id}</td>
                    <td><strong>{emp.first_name} {emp.last_name}</strong></td>
                    <td>{emp.work_email}</td>
                    <td><span className="role-badge manager">{emp.position}</span></td>
                    <td><button className="action-btn btn-password" onClick={() => openPasswordModal(emp)}>🔑 Змінити пароль</button></td>
                    <td><button className="action-btn btn-delete" onClick={() => handleDeleteEmployee(emp.employee_id)}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "products" && (
          <div className="admin-panel-card">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                <h1 style={{marginBottom: 0}}>📦 Товари</h1>
                <button className="btn-submit" style={{width: "auto", padding: "10px 20px"}} onClick={handleOpenAddProduct}>➕ Додати товар</button>
            </div>

            {/* 🔥 Панель фільтрів Товарів */}
            <div className="admin-filters-bar">
                <input 
                  type="text" 
                  placeholder="🔍 ID" 
                  value={prodFilters.id} 
                  onChange={e => setProdFilters({...prodFilters, id: e.target.value})}
                  className="filter-input-compact"
                />
                <input 
                  type="text" 
                  placeholder="📦 Назва товару..." 
                  value={prodFilters.name} 
                  onChange={e => setProdFilters({...prodFilters, name: e.target.value})}
                  className="filter-input-compact"
                />
                <select 
                  value={prodFilters.category} 
                  onChange={e => setProdFilters({...prodFilters, category: e.target.value})}
                  className="filter-select-compact"
                >
                    <option value="all">📂 Усі категорії</option>
                    {uniqueProductCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select 
                  value={prodFilters.supplier} 
                  onChange={e => setProdFilters({...prodFilters, supplier: e.target.value})}
                  className="filter-select-compact"
                >
                    <option value="all">🚚 Усі постачальники</option>
                    {suppliers.map(sup => <option key={sup.supplier_id} value={sup.supplier_id}>{sup.name}</option>)}
                </select>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th onClick={() => handleProdSort('product_id')} className="sortable-header">
                    ID {prodSortConfig.key === 'product_id' ? (prodSortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th>Фото</th>
                  <th onClick={() => handleProdSort('name')} className="sortable-header">
                    Назва {prodSortConfig.key === 'name' ? (prodSortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th>Категорія</th>
                  <th onClick={() => handleProdSort('price')} className="sortable-header">
                    Ціна {prodSortConfig.key === 'price' ? (prodSortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th>Постачальник</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {processedProducts.map(prod => (
                  <tr key={prod.product_id}>
                    <td>{prod.product_id}</td>
                    <td>{prod.image_url ? <img src={prod.image_url} alt="img" style={{width: "40px", height: "40px", objectFit: "cover"}} /> : "❌"}</td>
                    <td><strong>{prod.name}</strong></td>
                    <td>{prod.category}</td>
                    <td>{prod.price} ₴</td>
                    <td>{getSupplierName(prod.supplier_id)}</td>
                    <td>
                      <button className="action-btn btn-edit" onClick={() => handleOpenEditProduct(prod)}>✏️</button>
                      <button className="action-btn btn-delete" onClick={() => handleDeleteProduct(prod.product_id!)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {processedProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{textAlign: "center", padding: "30px", color: "#6c757d"}}>Товарів не знайдено 🕵️‍♂️</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODALS */}
      {showPasswordModal && (
        <div className="modal-overlay-admin">
          <div className="modal-admin">
            <h3>🔐 Зміна пароля</h3>
            <p>Новий пароль для: <strong>{selectedEmpName}</strong></p>
            <input type="text" placeholder="Новий пароль" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="password-input" />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>Скасувати</button>
              <button className="save-btn" onClick={handleSavePassword}>Зберегти</button>
            </div>
          </div>
        </div>
      )}

      {showSupplierModal && (
        <div className="modal-overlay-admin">
          <div className="modal-admin">
            <h3>{isEditingSupplier ? "✏️ Редагувати" : "➕ Додати"} постачальника</h3>
            <form onSubmit={handleSaveSupplier}>
                <div className="form-group"><label>Компанія:</label><input type="text" required value={currentSupplier.name} onChange={e => setCurrentSupplier({...currentSupplier, name: e.target.value})} /></div>
                <div className="form-group"><label>Контакт:</label><input type="text" value={currentSupplier.contact_person} onChange={e => setCurrentSupplier({...currentSupplier, contact_person: e.target.value})} /></div>
                <div className="form-row">
                    <div className="form-group"><label>Телефон:</label><input type="text" value={currentSupplier.phone} onChange={e => setCurrentSupplier({...currentSupplier, phone: e.target.value})} /></div>
                    <div className="form-group"><label>Email:</label><input type="email" value={currentSupplier.email} onChange={e => setCurrentSupplier({...currentSupplier, email: e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Адреса:</label><input type="text" value={currentSupplier.address} onChange={e => setCurrentSupplier({...currentSupplier, address: e.target.value})} /></div>
                <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowSupplierModal(false)}>Скасувати</button>
                    <button type="submit" className="save-btn">Зберегти</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="modal-overlay-admin">
          <div className="modal-admin" style={{maxWidth: "650px"}}>
             <h3>{isEditingProduct ? "✏️ Редагувати товар" : "📦 Додати товар"}</h3>
             <form onSubmit={handleProductSubmit}>
                  <div className="form-group"><label>Назва:</label><input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
                  <div className="form-row">
                      <div className="form-group"><label>Категорія:</label><select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option value="cats">🐱 Коти</option><option value="dogs">🐶 Собаки</option><option value="birds">🐦 Птахи</option><option value="fish">🐠 Риби</option></select></div>
                      <div className="form-group"><label>Ціна:</label><input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /></div>
                  </div>
                  <div className="form-group"><label>Постачальник:</label>
                    <select required value={newProduct.supplier_id} onChange={e => setNewProduct({...newProduct, supplier_id: e.target.value})}>
                      <option value="">Оберіть...</option>
                      {suppliers.map(sup => <option key={sup.supplier_id} value={sup.supplier_id}>{sup.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>URL Зображення:</label><input type="text" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} placeholder="https://..." /></div>
                  <div className="form-group"><label>Короткий опис (для карток):</label><textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Короткий опис товару..." /></div>
                  <div className="form-group"><label>Детальний опис (для вікна "Подробніше"):</label><textarea style={{minHeight: "150px"}} value={newProduct.long_description} onChange={e => setNewProduct({...newProduct, long_description: e.target.value})} placeholder="Введіть повну характеристику товару, склад, переваги тощо..." /></div>
                  <div className="form-row">
                      <div className="form-group"><label>Кількість:</label><input type="number" required value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} /></div>
                      <div className="form-group"><label>Склад:</label><input type="text" required value={newProduct.location} onChange={e => setNewProduct({...newProduct, location: e.target.value})} /></div>
                  </div>
                  <div className="modal-actions">
                      <button type="button" className="cancel-btn" onClick={() => setShowProductModal(false)}>Скасувати</button>
                      <button type="submit" className="save-btn">{isEditingProduct ? "Оновити" : "Зберегти"}</button>
                  </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
