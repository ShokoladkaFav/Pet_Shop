
import React, { useEffect, useState, useMemo } from "react";
// Fix: Import from react-router instead of react-router-dom
import { useNavigate } from "react-router";
import "./WorkerDashboard.css";

// Імпорт підкомпонентів
import WorkerDashboard_Orders from "./WorkerDashboard_Orders";
import WorkerDashboard_Vet from "./WorkerDashboard_Vet";
import WorkerDashboard_Storeg from "./WorkerDashboard_Storeg";
import WorkerDashboard_Personnal from "./WorkerDashboard_Personnal";
import WorkerDashboardSale from "./WorkerDashboard_Sale";

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  work_email: string;
  position: string;
  role: string;
}

interface VetRequest {
  id: number;
  client_name: string;
  email: string;
  type: string;
  description: string;
  status: "New" | "In Progress" | "Done" | "Cancelled";
  created_at: string;
}

interface StockItem {
  inventory_id: number;
  product_name: string;
  category: string;
  location: string;
  supplier_name: string | null;
  quantity: number;
  price?: number | string;
  image_url?: string;
}

interface OrderItem {
  order_number: string;
  inventory_id: number;
  quantity: number;
  price: string | number;
  subtotal: string | number;
  order_date: string | { date: string };
  status: string | null;
}

interface GroupedOrder {
  order_number: string;
  dateObj: Date;
  dateStr: string;
  status: string;
  total_price: number;
  items: OrderItem[];
}

interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
}

const WorkerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [vetRequests, setVetRequests] = useState<VetRequest[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [rawOrders, setRawOrders] = useState<OrderItem[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // States for Modals and Filters
  const [stockSearch, setStockSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterSupplier, setFilterSupplier] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof StockItem; direction: 'asc' | 'desc' }>({ key: 'inventory_id', direction: 'asc' });

  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ first_name: "", last_name: "", work_email: "", position: "Менеджер", password: "" });
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const getToken = () => sessionStorage.getItem("employee_token");

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error("Помилка відповіді сервера"); }
    if (!response.ok) throw new Error(data.message || "Помилка HTTP");
    return data;
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("employee");
    if (!stored) { navigate("/login"); return; }
    const parsed = JSON.parse(stored);
    
    let role = 'staff';
    const pos = parsed.position.toLowerCase();
    if (pos.includes('адмін') || pos.includes('admin')) role = 'admin';
    else if (pos.includes('менеджер') || pos.includes('manager')) role = 'manager';
    else if (pos.includes('вет') || pos.includes('лікар')) role = 'veterinarian';
    else if (pos.includes('склад') || pos.includes('warehouse')) role = 'warehouse';

    setEmployee({ ...parsed, role });
    fetchInitialData();
  }, [navigate]);

  const fetchInitialData = () => {
    fetchStock();
    fetchEmployees();
    fetchVetRequests();
    fetchOrders();
    fetchSales();
  };

  const fetchStock = async () => { try { const d = await authFetch("http://localhost/zoo-api/get_inventory.php"); setStock(d); } catch {} };
  const fetchEmployees = async () => { try { const d = await authFetch("http://localhost/zoo-api/get_employees.php"); setAllEmployees(d); } catch {} };
  const fetchVetRequests = async () => { try { const d = await authFetch("http://localhost/zoo-api/get_vet_requests.php"); setVetRequests(d); } catch {} };
  const fetchOrders = async () => { try { const d = await authFetch("http://localhost/zoo-api/get_orders.php"); setRawOrders(d); } catch {} };
  const fetchSales = async () => { try { const d = await authFetch("http://localhost/zoo-api/Sale.php"); setSales(Array.isArray(d) ? d : []); } catch {} };

  const parseDescription = (raw: string) => {
    const meta: { label: string; value: string }[] = [];
    let text = raw;
    let image = null;
    const metaRegex = /\[([^\]]+):\s*([^\]]+)\]/g;
    let match;
    while ((match = metaRegex.exec(raw)) !== null) {
      meta.push({ label: match[1], value: match[2] });
      text = text.replace(match[0], "");
    }
    const imgMatch = raw.match(/\[ATTACHMENT\](.*?)\[\/ATTACHMENT\]/);
    if (imgMatch) {
      image = imgMatch[1];
      text = text.replace(imgMatch[0], "");
    }
    return { text: text.trim(), meta, image };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "#d97706";
      case "Processing": return "#2563eb";
      case "Sent": case "Done": return "#059669";
      case "Cancelled": return "#dc2626";
      default: return "#475569";
    }
  };

  const standardizeStatus = (s: string | null): string => {
    if (!s) return "New";
    const low = s.toLowerCase();
    if (low.includes("process")) return "Processing";
    if (low.includes("sent")) return "Sent";
    if (low.includes("done")) return "Done";
    if (low.includes("cancel")) return "Cancelled";
    return "New";
  };

  const groupedOrders: GroupedOrder[] = useMemo(() => {
    const groups: Record<string, GroupedOrder> = {};
    rawOrders.forEach(item => {
      if (!groups[item.order_number]) {
        const d = item.order_date && typeof item.order_date === 'object' ? new Date(item.order_date.date) : new Date(item.order_date as string);
        groups[item.order_number] = {
          order_number: item.order_number,
          dateObj: d,
          dateStr: d.toLocaleString('uk-UA'),
          status: standardizeStatus(item.status),
          total_price: 0,
          items: []
        };
      }
      groups[item.order_number].items.push(item);
      groups[item.order_number].total_price += parseFloat(item.subtotal as string) || 0;
    });
    return Object.values(groups).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [rawOrders]);

  const processedStock = useMemo(() => {
    return stock.filter(item => 
      item.product_name.toLowerCase().includes(stockSearch.toLowerCase()) &&
      (filterCategory === "all" || item.category === filterCategory) &&
      (filterLocation === "all" || item.location === filterLocation) &&
      (filterSupplier === "all" || item.supplier_name === filterSupplier)
    ).sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal! < bVal!) return sortConfig.direction === 'asc' ? -1 : 1;
      return sortConfig.direction === 'asc' ? 1 : -1;
    });
  }, [stock, stockSearch, filterCategory, filterLocation, filterSupplier, sortConfig]);

  const handleOrderStatusChange = async (num: string, status: string) => {
    setUpdatingOrder(num);
    try {
      await authFetch("http://localhost/zoo-api/update_order_status.php", { method: "POST", body: JSON.stringify({ order_number: num, status }) });
      addToast("success", "Статус оновлено");
      fetchOrders();
    } catch { addToast("error", "Помилка оновлення"); }
    finally { setUpdatingOrder(null); }
  };

  const performDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await authFetch("http://localhost/zoo-api/delete_order.php", { method: "POST", body: JSON.stringify({ order_number: orderToDelete }) });
      addToast("success", "Замовлення видалено");
      fetchOrders();
    } catch { addToast("error", "Помилка видалення"); }
    finally { setOrderToDelete(null); }
  };

  const performDeleteVetRequest = async () => {
    if (requestToDelete === null) return;
    try {
      await authFetch("http://localhost/zoo-api/delete_vet_request.php", { method: "POST", body: JSON.stringify({ id: requestToDelete }) });
      addToast("success", "Заявку видалено");
      fetchVetRequests();
    } catch { addToast("error", "Помилка видалення"); }
    finally { setRequestToDelete(null); }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authFetch("http://localhost/zoo-api/add_employee.php", { method: "POST", body: JSON.stringify(newEmp) });
      addToast("success", "Працівника додано");
      setShowAddEmpModal(false);
      fetchEmployees();
    } catch { addToast("error", "Помилка"); }
  };

  const hasPermission = (roles: string[]) => employee && (roles.includes(employee.role) || employee.role === 'admin');

  const getToastIcon = (type: string) => {
    if (type === 'success') return '✅';
    if (type === 'error') return '❌';
    return 'ℹ️';
  };

  if (!employee) return <div>Завантаження...</div>;

  return (
    <div className="dashboard-container">
      <div className="dash-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`dash-toast ${t.type}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{getToastIcon(t.type)}</span>
              <span>{t.text}</span>
            </div>
            <button className="close-btn" onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}>✕</button>
          </div>
        ))}
      </div>

      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="avatar">{employee.first_name[0]}</div>
          <h3>{employee.first_name} {employee.last_name}</h3>
          <span className={`role-badge ${employee.role}`}>{employee.position}</span>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>🏠 Огляд</button>
          {hasPermission(["warehouse", "manager"]) && <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>🛒 Замовлення</button>}
          {hasPermission(["warehouse", "manager"]) && <button className={activeTab === "stock" ? "active" : ""} onClick={() => setActiveTab("stock")}>📦 Склад</button>}
          {hasPermission(["manager"]) && <button className={activeTab === "promotions" ? "active" : ""} onClick={() => setActiveTab("promotions")}>🎉 Акції</button>}
          {hasPermission(["veterinarian"]) && <button className={activeTab === "vet" ? "active" : ""} onClick={() => setActiveTab("vet")}>🩺 Заявки (Вет)</button>}
          {hasPermission(["manager"]) && <button className={activeTab === "hr" ? "active" : ""} onClick={() => setActiveTab("hr")}>👥 Персонал</button>}
          
          {hasPermission(["admin", "manager"]) && (
            <button 
              className="admin-link-btn" 
              onClick={() => navigate("/admin-panel")}
              style={{ marginTop: "10px", backgroundColor: "#475569", color: "#fbbf24" }}
            >
              ⚙️ Адмін Панель
            </button>
          )}
        </nav>
        <button className="logout-btn-dash" onClick={() => { sessionStorage.clear(); navigate("/login"); }}>🚪 Вийти</button>
      </aside>

      <main className="dashboard-content">
        {activeTab === "overview" && (
          <div className="panel">
            <div className="overview-welcome">
                <div className="welcome-text">
                    <h1>Привіт, {employee.first_name}! 👋</h1>
                    <p>Сьогодні {currentTime.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="time-widget">
                    <span className="clock">{currentTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="label">Поточний час</span>
                </div>
            </div>

            <div className="overview-stats-grid">
                <div className="luxury-card" style={{ animationDelay: '0.1s' }}>
                    <div className="card-icon blue">🛒</div>
                    <div className="card-info">
                        <h4>Нові замовлення</h4>
                        <span className="stat-value">{groupedOrders.filter(o => o.status === 'New').length}</span>
                    </div>
                </div>
                <div className="luxury-card" style={{ animationDelay: '0.2s' }}>
                    <div className="card-icon green">🩺</div>
                    <div className="card-info">
                        <h4>Активні Заявки (Вет)</h4>
                        <span className="stat-value">{vetRequests.filter(r => r.status === 'New').length}</span>
                    </div>
                </div>
                <div className="luxury-card" style={{ animationDelay: '0.3s' }}>
                    <div className="card-icon orange">🔥</div>
                    <div className="card-info">
                        <h4>Кількість акцій</h4>
                        <span className="stat-value">{sales.length}</span>
                    </div>
                </div>
                <div className="luxury-card" style={{ animationDelay: '0.4s' }}>
                    <div className="card-icon red">📦</div>
                    <div className="card-info">
                        <h4>Товарів у базі</h4>
                        <span className="stat-value">{stock.length}</span>
                    </div>
                </div>
            </div>

            <div className="quick-actions-panel">
                <h2>⚡ Швидкий доступ</h2>
                <div className="quick-actions-grid">
                    <button className="action-card-btn" onClick={() => setActiveTab("orders")}>
                        <span>📦</span>
                        <strong>Замовлення</strong>
                    </button>
                    <button className="action-card-btn" onClick={() => setActiveTab("promotions")}>
                        <span>🎉</span>
                        <strong>Нова Акція</strong>
                    </button>
                    <button className="action-card-btn" onClick={() => setActiveTab("stock")}>
                        <span>📊</span>
                        <strong>Інвентар</strong>
                    </button>
                    <button className="action-card-btn" onClick={() => setActiveTab("hr")}>
                        <span>👥</span>
                        <strong>Команда</strong>
                    </button>
                </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <WorkerDashboard_Orders 
            groupedOrders={groupedOrders}
            updatingOrder={updatingOrder}
            handleOrderStatusChange={handleOrderStatusChange}
            confirmDeleteOrder={setOrderToDelete}
            fetchOrders={fetchOrders}
            getProductName={(id) => stock.find(s => s.inventory_id === id)?.product_name || `ID ${id}`}
            getStatusColor={getStatusColor}
          />
        )}

        {activeTab === "stock" && (
          <WorkerDashboard_Storeg 
            processedStock={processedStock}
            stockSearch={stockSearch}
            setStockSearch={setStockSearch}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterLocation={filterLocation}
            setFilterLocation={setFilterLocation}
            filterSupplier={filterSupplier}
            setFilterSupplier={setFilterSupplier}
            uniqueCategories={Array.from(new Set(stock.map(s => s.category)))}
            uniqueLocations={Array.from(new Set(stock.map(s => s.location)))}
            uniqueSuppliers={Array.from(new Set(stock.map(s => s.supplier_name || "Невідомо")))}
            sortConfig={sortConfig}
            handleSort={(k) => setSortConfig(c => ({ key: k, direction: c.key === k && c.direction === 'asc' ? 'desc' : 'asc' }))}
            fetchStock={fetchStock}
          />
        )}

        {activeTab === "vet" && (
          <WorkerDashboard_Vet 
            vetRequests={vetRequests}
            handleVetRequestStatus={async (id, s) => {
              await authFetch("http://localhost/zoo-api/update_vet_request.php", { method: "POST", body: JSON.stringify({ id, status: s }) });
              fetchVetRequests();
              addToast("success", "Статус заявки оновлено");
            }}
            confirmDeleteVetRequest={setRequestToDelete}
            fetchVetRequests={fetchVetRequests}
            translateVetType={(t) => {
              if (t === 'consultation') return '🩺 Консультація';
              if (t === 'nutrition') return '🥦 Харчування';
              return '🔬 Діагностика';
            }}
            parseDescription={parseDescription}
            getStatusColor={getStatusColor}
          />
        )}

        {activeTab === "hr" && (
          <WorkerDashboard_Personnal 
            allEmployees={allEmployees}
            currentEmployeeId={employee.employee_id}
            setShowAddEmpModal={setShowAddEmpModal}
            handleDeleteEmployee={async (id) => {
              if (window.confirm("Видалити?")) {
                await authFetch("http://localhost/zoo-api/delete_employee.php", { method: "POST", body: JSON.stringify({ employee_id: id }) });
                fetchEmployees();
                addToast("info", "Працівника видалено");
              }
            }}
          />
        )}

        {activeTab === "promotions" && (
          <WorkerDashboardSale 
            authFetch={authFetch}
            addToast={addToast}
            stock={stock}
          />
        )}
      </main>

      {/* Confirmation Modals */}
      {orderToDelete && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3>Видалити замовлення #{orderToDelete}?</h3>
            <div className="confirm-actions">
              <button className="btn-confirm-cancel" onClick={() => setOrderToDelete(null)}>Ні</button>
              <button className="btn-confirm-delete" onClick={performDeleteOrder}>Так</button>
            </div>
          </div>
        </div>
      )}

      {requestToDelete !== null && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3>Видалити заявку?</h3>
            <div className="confirm-actions">
              <button className="btn-confirm-cancel" onClick={() => setRequestToDelete(null)}>Ні</button>
              <button className="btn-confirm-delete" onClick={performDeleteVetRequest}>Так</button>
            </div>
          </div>
        </div>
      )}

      {showAddEmpModal && (
        <div className="modal-overlay-dash">
          <div className="modal-dash">
            <h3>Новий працівник</h3>
            <form onSubmit={handleCreateEmployee}>
              <div className="form-group-dash" style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px' }}>Ім'я</label><input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} required value={newEmp.first_name} onChange={e => setNewEmp({...newEmp, first_name: e.target.value})} /></div>
              <div className="form-group-dash" style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px' }}>Email</label><input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} type="email" required value={newEmp.work_email} onChange={e => setNewEmp({...newEmp, work_email: e.target.value})} /></div>
              <div className="form-group-dash" style={{ marginBottom: '25px' }}><label style={{ display: 'block', marginBottom: '5px' }}>Пароль</label><input style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} type="password" required value={newEmp.password} onChange={e => setNewEmp({...newEmp, password: e.target.value})} /></div>
              <div className="confirm-actions">
                <button type="button" className="btn-confirm-cancel" onClick={() => setShowAddEmpModal(false)}>Скасувати</button>
                <button type="submit" className="btn-confirm-delete" style={{ background: '#3b82f6' }}>Створити</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
