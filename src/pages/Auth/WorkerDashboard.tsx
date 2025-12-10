
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./WorkerDashboard.css";

// Інтерфейс працівника
interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  work_email: string;
  position: string;
  role: string;
}

// Заявки ветеринара (з БД)
interface VetRequest {
  id: number;
  client_name: string;
  email: string;
  type: string;
  description: string;
  status: "New" | "In Progress" | "Done" | "Cancelled"; 
  created_at: string;
}

// Інтерфейс складу
interface StockItem {
  inventory_id: number;
  product_name: string;
  category: string;
  location: string;
  supplier_name: string | null;
  quantity: number;
}

// Інтерфейс повідомлень
interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
}

const WorkerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  
  const [vetRequests, setVetRequests] = useState<VetRequest[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  // === State для Складу (Фільтри та Сортування) ===
  const [stockSearch, setStockSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof StockItem; direction: 'asc' | 'desc' }>({
    key: 'inventory_id',
    direction: 'asc'
  });

  // State for Add Employee Modal
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    first_name: "",
    last_name: "",
    work_email: "",
    position: "Менеджер",
    password: ""
  });

  // === STATE ДЛЯ МОДАЛЬНОГО ВІКНА ВИДАЛЕННЯ ===
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);

  // State for Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 8000); // 8 секунд для помилок
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToken = () => sessionStorage.getItem("employee_token");

  // Helper для безпечних запитів (додає токен)
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      // Якщо сервер повернув HTML з помилкою (наприклад, PHP Warning), json() впаде
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Server Non-JSON Response:", text);
        
        // 🔥 РОЗПІЗНАВАННЯ ПОМИЛОК PHP 🔥
        if (text.includes("Undefined variable") && text.includes("$conn")) {
             throw new Error("PHP Error: Змінна $conn не знайдена. Перевірте підключення до БД у файлі PHP.");
        }
        if (text.includes("Call to a member function prepare() on null")) {
             throw new Error("PHP Error: Немає підключення до БД ($conn is null).");
        }
        
        throw new Error("Сервер повернув HTML замість JSON (див. консоль).");
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error ${response.status}`);
      }

      return data;
    } catch (error: any) {
        // 🔥 РОЗПІЗНАВАННЯ ПОМИЛОК CORS 🔥
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error("CORS Помилка: Додайте Header 'Authorization' у файл PHP (див. інструкцію).");
        }
        throw error;
    }
  };

  // Map roles
  const mapPositionToRole = (pos: string): string => {
    const normalizedPos = pos ? pos.toLowerCase().trim() : "";
    if (normalizedPos.includes('адмін') || normalizedPos.includes('admin')) return 'admin';
    if (normalizedPos.includes('ветеринар') || normalizedPos.includes('vet')) return 'veterinarian';
    if (normalizedPos.includes('комірник') || normalizedPos.includes('warehouse') || normalizedPos.includes('склад')) return 'warehouse';
    if (normalizedPos.includes('касир') || normalizedPos.includes('cashier')) return 'cashier';
    if (normalizedPos.includes('менеджер') || normalizedPos.includes('manager') || normalizedPos.includes('продавець') || normalizedPos.includes('консультант')) return 'manager';
    return 'manager'; 
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("employee");
    if (!stored) {
      navigate("/login");
      return;
    }
    
    try {
        const parsedEmp = JSON.parse(stored);
        const normalizedEmp: Employee = {
            employee_id: parsedEmp.employee_id || parsedEmp.id,
            first_name: parsedEmp.first_name || "Співробітник",
            last_name: parsedEmp.last_name || "",
            work_email: parsedEmp.work_email,
            position: parsedEmp.position || "Не вказано",
            role: parsedEmp.role || mapPositionToRole(parsedEmp.position || "")
        };
        setEmployee(normalizedEmp);
    } catch (e) {
        console.error("Error parsing employee data", e);
        navigate("/login");
    }

    fetchStock();
    fetchEmployees();
    fetchVetRequests(); 

  }, [navigate]);

  const fetchStock = async () => {
    try {
      const data = await authFetch("http://localhost/zoo-api/get_inventory.php");
      if (Array.isArray(data)) setStock(data);
    } catch (e) {
      console.error("Помилка завантаження складу:", e);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await authFetch("http://localhost/zoo-api/get_employees.php");
      if (Array.isArray(data)) setAllEmployees(data);
    } catch (e) {
      console.error("Помилка завантаження працівників:", e);
    }
  };

  const fetchVetRequests = async () => {
    try {
      const data = await authFetch("http://localhost/zoo-api/get_vet_requests.php");
      if (Array.isArray(data)) setVetRequests(data);
    } catch (e: any) {
      console.error("Vet requests error:", e);
      addToast("error", `Заявки: ${e.message}`);
    }
  };

  // 🔥 Хелпер для нормалізації рядків (прибирає зайві пробіли та регістр)
  const normalizeStr = (str: string | null): string => {
    if (!str) return "";
    return str.trim().replace(/\s+/g, ' ').toLowerCase();
  };

  // 🔥 Отримання унікальних значень для фільтрів (використовуємо Map для дедублікації)
  const uniqueCategories = useMemo(() => {
      const map = new Map<string, string>();
      stock.forEach(item => {
          const raw = item.category || "Інше";
          const norm = normalizeStr(raw);
          if (!map.has(norm)) {
              map.set(norm, raw.trim());
          }
      });
      return Array.from(map.values()).sort();
  }, [stock]);

  const uniqueLocations = useMemo(() => {
      const map = new Map<string, string>();
      stock.forEach(item => {
          const raw = item.location || "Не вказано";
          const norm = normalizeStr(raw);
          if (!map.has(norm)) {
              map.set(norm, raw.trim());
          }
      });
      return Array.from(map.values()).sort();
  }, [stock]);

  const uniqueSuppliers = useMemo(() => {
      const map = new Map<string, string>();
      stock.forEach(item => {
          const raw = item.supplier_name || "Невідомо";
          const norm = normalizeStr(raw);
          if (!map.has(norm)) {
              map.set(norm, raw.trim());
          }
      });
      return Array.from(map.values()).sort();
  }, [stock]);

  // 🔥 Логіка фільтрації та сортування складу
  const processedStock = useMemo(() => {
    let data = [...stock];

    // 1. Пошук
    if (stockSearch) {
        data = data.filter(item => 
            item.product_name.toLowerCase().includes(stockSearch.toLowerCase())
        );
    }

    // 2. Фільтри (порівнюємо нормалізовані значення)
    if (filterCategory !== "all") {
        data = data.filter(item => {
            const val = item.category || "Інше";
            return normalizeStr(val) === normalizeStr(filterCategory);
        });
    }
    if (filterLocation !== "all") {
        data = data.filter(item => {
            const val = item.location || "Не вказано";
            return normalizeStr(val) === normalizeStr(filterLocation);
        });
    }
    if (filterSupplier !== "all") {
        data = data.filter(item => {
            const val = item.supplier_name || "Невідомо";
            return normalizeStr(val) === normalizeStr(filterSupplier);
        });
    }

    // 3. Сортування
    data.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Обробка null значень
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return data;
  }, [stock, stockSearch, filterCategory, filterLocation, filterSupplier, sortConfig]);

  // Обробник кліку по заголовку таблиці для сортування
  const handleSort = (key: keyof StockItem) => {
    setSortConfig(current => ({
        key,
        direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 🔥 Крок 1: Відкрити модалку
  const confirmDeleteVetRequest = (id: number) => {
    setRequestToDelete(id);
  };

  // 🔥 Крок 2: Виконати видалення
  const performDeleteVetRequest = async () => {
    if (requestToDelete === null) return;
    
    const id = requestToDelete;

    try {
        const result = await authFetch("http://localhost/zoo-api/delete_vet_request.php", {
            method: "POST",
            body: JSON.stringify({ id })
        });
        
        if (result.status === "success") {
            setVetRequests(prev => prev.filter(req => req.id !== id));
            addToast("success", "Заявку успішно видалено");
        } else {
            addToast("error", "Помилка: " + (result.message || "Не вдалося видалити"));
        }
    } catch (e: any) {
        console.error("Delete Error:", e);
        addToast("error", `${e.message}`);
    } finally {
        setRequestToDelete(null); // Закрити модалку в будь-якому разі
    }
  };

  const handleVetRequestStatus = async (id: number, newStatus: string) => {
    const oldRequests = [...vetRequests];
    setVetRequests(prev => prev.map(req => 
        req.id === id ? {...req, status: newStatus as any} : req
    ));

    try {
        const result = await authFetch("http://localhost/zoo-api/update_vet_request.php", {
            method: "POST",
            body: JSON.stringify({ id: id, status: newStatus })
        });
        
        if (result.status === "success") {
           addToast("success", `Статус оновлено на ${newStatus}`);
        } else {
            addToast("error", "Помилка оновлення статусу");
            setVetRequests(oldRequests);
        }
    } catch (e) {
        addToast("error", "Помилка сервера при оновленні статусу");
        setVetRequests(oldRequests);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.first_name || !newEmp.work_email || !newEmp.password) {
        addToast("error", "Заповніть обов'язкові поля!");
        return;
    }

    try {
        const result = await authFetch("http://localhost/zoo-api/add_employee.php", {
            method: "POST",
            body: JSON.stringify(newEmp)
        });

        if (result.status === "success") {
            addToast("success", `Працівника ${newEmp.first_name} успішно створено!`);
            setShowAddEmpModal(false);
            setNewEmp({ first_name: "", last_name: "", work_email: "", position: "Менеджер", password: "" });
            fetchEmployees();
        } else {
            addToast("error", "Помилка: " + result.message);
        }
    } catch (error: any) {
        addToast("error", `Помилка: ${error.message}`);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!window.confirm("Ви дійсно хочете звільнити (видалити) цього працівника?")) return;

    try {
        const result = await authFetch("http://localhost/zoo-api/delete_employee.php", {
            method: "POST",
            body: JSON.stringify({ employee_id: id })
        });

        if (result.status === "success") {
            addToast("success", "Працівника видалено.");
            fetchEmployees();
        } else {
            addToast("error", "Помилка: " + result.message);
        }
    } catch (error: any) {
        addToast("error", `Помилка: ${error.message}`);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("employee");
    sessionStorage.removeItem("employee_token");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const hasPermission = (allowedRoles: string[]) => {
    if (!employee) return false;
    return allowedRoles.includes(employee.role) || employee.role === "admin";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case "New": return "#d97706";
        case "In Progress": return "#2563eb";
        case "Done": return "#059669";
        case "Cancelled": return "#dc2626";
        default: return "#475569";
    }
  };

  const translateVetType = (type: string) => {
    switch (type.toLowerCase()) {
        case "consultation": return "🩺 Консультація";
        case "diagnosis": return "🔬 Діагностика";
        case "nutrition": return "🥦 Харчування";
        case "general": return "📝 Загальне";
        default: return type;
    }
  };

  // 🔥 Розпаковка даних з опису
  const parseDescription = (rawDesc: string) => {
    let text = rawDesc || "";
    const meta: { label: string; value: string }[] = [];
    let image = null;

    const formatMatch = text.match(/\[Формат: (.*?)\]/);
    if (formatMatch) {
      meta.push({ label: "Формат", value: formatMatch[1] });
      text = text.replace(formatMatch[0], "");
    }

    const animalMatch = text.match(/\[Тварина: (.*?)\]/);
    if (animalMatch) {
      meta.push({ label: "Тварина", value: animalMatch[1] });
      text = text.replace(animalMatch[0], "");
    }

    const imgMatch = text.match(/\[ATTACHMENT\](.*?)\[\/ATTACHMENT\]/s);
    if (imgMatch) {
        image = imgMatch[1]; 
        text = text.replace(imgMatch[0], "");
    }
    
    text = text.replace(/\[Тип: (.*?)\]/, "");

    return { text: text.trim(), meta, image };
  };

  if (!employee) return <div className="loading-screen">Завантаження кабінету...</div>;

  return (
    <div className="dashboard-container">
      {/* TOAST NOTIFICATIONS */}
      <div className="dash-toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`dash-toast ${toast.type}`}>
             <span>{toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : 'ℹ️'} {toast.text}</span>
             <button className="close-btn" onClick={() => removeToast(toast.id)}>✕</button>
          </div>
        ))}
      </div>

      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="avatar">{employee.first_name.charAt(0)}</div>
          <h3>{employee.first_name} {employee.last_name}</h3>
          <span className={`role-badge ${employee.role}`}>{employee.position}</span>
        </div>

        <nav className="sidebar-nav">
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
            🏠 Огляд
          </button>
          {(hasPermission(["veterinarian"])) && (
            <button className={activeTab === "vet" ? "active" : ""} onClick={() => { setActiveTab("vet"); fetchVetRequests(); }}>
              🩺 Заявки (Вет)
            </button>
          )}
          {(hasPermission(["warehouse", "manager"])) && (
            <button className={activeTab === "stock" ? "active" : ""} onClick={() => setActiveTab("stock")}>
              📦 Склад і Товари
            </button>
          )}
          {(hasPermission(["manager", "admin"])) && (
            <button className={activeTab === "hr" ? "active" : ""} onClick={() => setActiveTab("hr")}>
              👥 Управління персоналом
            </button>
          )}
          {employee.role === "admin" && (
            <button className="admin-link-btn" onClick={() => navigate("/admin-panel")} style={{ color: "#ffc107", fontWeight: "bold" }}>
              🛠️ Адмін Панель
            </button>
          )}
        </nav>

        <button className="logout-btn-dash" onClick={handleLogout}>🚪 Вийти</button>
      </aside>

      <main className="dashboard-content">
        {activeTab === "overview" && (
          <div className="panel fade-in">
            <h1>👋 Вітаємо у робочому просторі!</h1>
            <p>Ваша посада: <strong>{employee.position.toUpperCase()}</strong></p>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>📅 Дата</h4>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
              <div className="stat-card info">
                <h4>🩺 Активні заявки</h4>
                <p>{vetRequests.filter(r => r.status === "New" || r.status === "In Progress").length}</p>
              </div>
              <div className="stat-card warning">
                <h4>📦 Товарів на складі</h4>
                <p>{stock.length}</p>
              </div>
            </div>
          </div>
        )}
            
        {/* === СКЛАД (WAREHOUSE) === */}
        {activeTab === "stock" && hasPermission(["warehouse", "manager"]) && (
          <div className="panel fade-in">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px"}}>
                <h2>📦 Управління Складом</h2>
                <div style={{display: "flex", gap: "10px"}}>
                    <button className="action-btn" onClick={fetchStock}>🔄 Оновити</button>
                </div>
            </div>

            {/* 🔥 ПАНЕЛЬ ФІЛЬТРІВ */}
            <div className="stock-controls">
                <input 
                    type="text" 
                    placeholder="🔍 Пошук товару..." 
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    className="stock-search-input"
                />
                
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="stock-select">
                    <option value="all">📂 Всі категорії</option>
                    {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="stock-select">
                    <option value="all">📍 Всі склади</option>
                    {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>

                <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} className="stock-select">
                    <option value="all">🚚 Всі постачальники</option>
                    {uniqueSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            
            <div className="table-responsive">
              <table className="data-table stock-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('inventory_id')} className="sortable-header">
                        ID Інв. {sortConfig.key === 'inventory_id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th>Товар</th>
                    <th>Категорія</th>
                    <th>Сектор складу</th>
                    <th>Постачальник</th>
                    <th onClick={() => handleSort('quantity')} className="sortable-header">
                        Кількість {sortConfig.key === 'quantity' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {processedStock.map((item) => (
                    <tr key={item.inventory_id}>
                      <td>{item.inventory_id}</td>
                      <td><strong>{item.product_name}</strong></td>
                      <td>
                          <span className="stock-tag category">{item.category}</span>
                      </td>
                      <td>
                          <span className="stock-tag location">{item.location}</span>
                      </td>
                      <td>{item.supplier_name || "—"}</td>
                      <td>
                        <span className={`quantity-badge ${item.quantity < 10 ? 'low' : 'ok'}`}>
                            {item.quantity} шт.
                        </span>
                      </td>
                    </tr>
                  ))}
                  {processedStock.length === 0 && <tr><td colSpan={6} style={{textAlign: "center"}}>Нічого не знайдено 🕵️‍♂️</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* === ВЕТЕРИНАР === */}
        {activeTab === "vet" && hasPermission(["veterinarian"]) && (
          <div className="panel fade-in">
             {/* ... (код ветеринара без змін) ... */}
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <h2>🩺 Заявки від клієнтів</h2>
                <button className="action-btn" onClick={fetchVetRequests}>🔄 Оновити</button>
            </div>
            
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Клієнт</th>
                    <th>Тип послуги</th>
                    <th style={{width: "40%"}}>Деталі запиту</th>
                    <th>Статус</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {vetRequests.map((req) => {
                    const { text, meta, image } = parseDescription(req.description);

                    return (
                        <tr key={req.id} className={req.status === 'Cancelled' ? 'row-cancelled' : ''}>
                          <td>#{req.id}
                              <br/><span style={{fontSize:"0.75rem", color:"#888"}}>{new Date(req.created_at).toLocaleDateString()}</span>
                          </td>
                          <td>
                            <strong>{req.client_name}</strong><br/>
                            <span style={{fontSize: "0.8rem", color: "#666"}}>{req.email}</span>
                          </td>
                          <td>
                            <span className={`type-badge ${req.type}`}>
                                {translateVetType(req.type)}
                            </span>
                          </td>
                          <td>
                            <div className="req-meta-container">
                                {meta.map((m, idx) => (
                                    <span key={idx} className="meta-tag">
                                        <strong>{m.label}:</strong> {m.value}
                                    </span>
                                ))}
                            </div>
                            
                            <p style={{fontSize: "0.9rem", margin: "5px 0", whiteSpace: "pre-wrap"}}>{text}</p>
                            
                            {image && (
                                <div className="req-image-preview">
                                    <img src={image} alt="Diagnosis" onClick={() => {
                                        const w = window.open("");
                                        w?.document.write(`<img src="${image}" style="max-width:100%"/>`);
                                    }} />
                                    <span className="img-hint">(Натисніть для збільшення)</span>
                                </div>
                            )}
                          </td>
                          <td>
                            <select 
                                value={req.status} 
                                onChange={(e) => handleVetRequestStatus(req.id, e.target.value)}
                                className="status-select"
                                style={{borderColor: getStatusColor(req.status)}}
                            >
                                <option value="New">🟡 Нова</option>
                                <option value="In Progress">🔵 В процесі</option>
                                <option value="Done">🟢 Виконано</option>
                                <option value="Cancelled">🔴 Скасовано</option>
                            </select>
                          </td>
                          <td>
                             <button 
                                className="delete-icon-btn" 
                                title="Видалити заявку"
                                onClick={() => confirmDeleteVetRequest(req.id)}
                            >
                                🗑️
                            </button>
                          </td>
                        </tr>
                    );
                  })}
                  {vetRequests.length === 0 && <tr><td colSpan={6}>Немає заявок 📭</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* === HR === */}
        {activeTab === "hr" && hasPermission(["manager", "admin"]) && (
           <div className="panel fade-in">
              <h2>👥 Управління персоналом</h2>
              <button className="primary-btn" onClick={() => setShowAddEmpModal(true)}>➕ Додати працівника</button>
              <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr><th>ID</th><th>Ім'я</th><th>Email</th><th>Посада</th><th>Дії</th></tr>
                    </thead>
                    <tbody>
                        {allEmployees.map(emp => (
                            <tr key={emp.employee_id}>
                                <td>{emp.employee_id}</td>
                                <td>{emp.first_name} {emp.last_name}</td>
                                <td>{emp.work_email}</td>
                                <td>{emp.position}</td>
                                <td>
                                    {emp.employee_id !== employee.employee_id && (
                                        <button className="action-btn" style={{color: "red"}} onClick={() => handleDeleteEmployee(emp.employee_id)}>❌</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
           </div>
        )}
        
      </main>

       {/* === MODAL ADD EMPLOYEE === */}
      {showAddEmpModal && (
        <div className="modal-overlay-dash">
          <div className="modal-dash">
            <h3>👤 Новий працівник</h3>
            <form onSubmit={handleCreateEmployee}>
                <div className="form-group-dash">
                    <label>Ім'я:</label>
                    <input type="text" required value={newEmp.first_name} onChange={e => setNewEmp({...newEmp, first_name: e.target.value})} />
                </div>
                <div className="form-group-dash">
                    <label>Прізвище:</label>
                    <input type="text" value={newEmp.last_name} onChange={e => setNewEmp({...newEmp, last_name: e.target.value})} />
                </div>
                <div className="form-group-dash">
                    <label>Email:</label>
                    <input type="email" required value={newEmp.work_email} onChange={e => setNewEmp({...newEmp, work_email: e.target.value})} />
                </div>
                <div className="form-group-dash">
                    <label>Посада:</label>
                    <select value={newEmp.position} onChange={e => setNewEmp({...newEmp, position: e.target.value})}>
                        <option value="Менеджер">Менеджер</option>
                        <option value="Продавець-консультант">Продавець-консультант</option>
                        <option value="Ветеринар">Ветеринар</option>
                        <option value="Складський працівник">Складський працівник</option>
                        <option value="Касир">Касир</option>
                        <option value="Адмін">Адміністратор</option>
                    </select>
                </div>
                <div className="form-group-dash">
                    <label>Пароль:</label>
                    <input type="text" required value={newEmp.password} onChange={e => setNewEmp({...newEmp, password: e.target.value})} />
                </div>
                <div className="modal-actions-dash">
                    <button type="button" className="cancel-btn-dash" onClick={() => setShowAddEmpModal(false)}>Скасувати</button>
                    <button type="submit" className="save-btn-dash">Створити</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL CONFIRM DELETE === */}
      {requestToDelete !== null && (
        <div className="confirm-overlay">
            <div className="confirm-modal">
                <span className="warning-icon">⚠️</span>
                <h3 className="confirm-title">Видалити заявку?</h3>
                <p className="confirm-text">Ви дійсно хочете видалити цю заявку? <br/> Ця дія є <strong>незворотною</strong>.</p>
                <div className="confirm-actions">
                    <button className="btn-confirm-cancel" onClick={() => setRequestToDelete(null)}>Скасувати</button>
                    <button className="btn-confirm-delete" onClick={performDeleteVetRequest}>Так, видалити</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default WorkerDashboard;
