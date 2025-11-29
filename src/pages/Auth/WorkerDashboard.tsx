import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WorkerDashboard.css";

// Інтерфейс працівника (для відображення)
interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  work_email: string;
  position: string;
  role: string;
}

// Заявки ветеринара (локальні)
interface VetRequest {
  id: number;
  clientName: string;
  type: string;
  desc: string;
  date: string;
  status: "New" | "Done";
}

// 🔄 ОНОВЛЕНО: Інтерфейс складу (відповідає Doctrine get_inventory.php)
interface StockItem {
  inventory_id: number;
  product_name: string;
  category: string;
  location: string;
  supplier_name: string | null;
  quantity: number;
}

const WorkerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  
  const [vetRequests, setVetRequests] = useState<VetRequest[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    first_name: "",
    last_name: "",
    work_email: "",
    position: "Менеджер",
    password: ""
  });

  const mapPositionToRole = (pos: string): string => {
    const normalizedPos = pos ? pos.toLowerCase().trim() : "";
    if (normalizedPos.includes('адмін') || normalizedPos.includes('admin')) return 'admin';
    if (normalizedPos.includes('менеджер') || normalizedPos.includes('manager')) return 'manager';
    if (normalizedPos.includes('ветеринар') || normalizedPos.includes('vet')) return 'veterinarian';
    if (normalizedPos.includes('комірник') || normalizedPos.includes('warehouse')) return 'warehouse';
    if (normalizedPos.includes('касир') || normalizedPos.includes('cashier')) return 'cashier';
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

    // 1. Заявки ветеринара (Local Storage)
    const storedRequests = localStorage.getItem("vet_requests_db");
    if (storedRequests) {
      try {
        setVetRequests(JSON.parse(storedRequests));
      } catch (e) {}
    } else {
      setVetRequests([
        { id: 101, clientName: "Олена", type: "consultation", desc: "Котик чхає", date: "2023-10-25", status: "New" },
        { id: 102, clientName: "Іван", type: "nutrition", desc: "Корм для мопса", date: "2023-10-26", status: "Done" }
      ]);
    }

    // 2. Склад
    fetchStock();

    // 3. Працівники
    fetchEmployees();

  }, [navigate]);

  const fetchStock = async () => {
    try {
      const res = await fetch("http://localhost/zoo-api/get_inventory.php");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setStock(data);
        }
      }
    } catch (e) {
      console.error("Помилка завантаження складу:", e);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost/zoo-api/get_employees.php");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllEmployees(data);
        }
      }
    } catch (e) {
      console.error("Помилка завантаження працівників:", e);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.first_name || !newEmp.work_email || !newEmp.password) {
        alert("Заповніть обов'язкові поля!");
        return;
    }

    try {
        const response = await fetch("http://localhost/zoo-api/add_employee.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newEmp)
        });
        const result = await response.json();

        if (result.status === "success") {
            alert(`✅ Працівника ${newEmp.first_name} успішно створено!`);
            setShowAddEmpModal(false);
            setNewEmp({ first_name: "", last_name: "", work_email: "", position: "Менеджер", password: "" });
            fetchEmployees();
        } else {
            alert("❌ Помилка: " + result.message);
        }
    } catch (error) {
        console.error(error);
        alert("❌ Помилка з'єднання з сервером.");
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!window.confirm("Ви дійсно хочете звільнити (видалити) цього працівника?")) return;

    try {
        const response = await fetch("http://localhost/zoo-api/delete_employee.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

  const handleLogout = () => {
    sessionStorage.removeItem("employee");
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const hasPermission = (allowedRoles: string[]) => {
    if (!employee) return false;
    return allowedRoles.includes(employee.role) || employee.role === "admin";
  };

  if (!employee) return <div className="loading-screen">Завантаження кабінету...</div>;

  return (
    <div className="dashboard-container">
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
            <button className={activeTab === "vet" ? "active" : ""} onClick={() => setActiveTab("vet")}>
              🩺 Заявки (Вет)
            </button>
          )}
          {(hasPermission(["warehouse", "manager"])) && (
            <button className={activeTab === "stock" ? "active" : ""} onClick={() => setActiveTab("stock")}>
              📦 Склад і Товари
            </button>
          )}
          {(hasPermission(["manager"])) && (
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
                <h4>👥 Працівників</h4>
                <p>{allEmployees.length}</p>
              </div>
              <div className="stat-card warning">
                <h4>📦 Товарів на складі</h4>
                <p>{stock.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* ... Решта коду WorkerDashboard ідентична ... */}
        {/* Задля економії місця я пропустив повторення частин, які не змінювалися, 
            оскільки основна логіка отримання даних вже виправлена вище */}
            
        {/* === СКЛАД (WAREHOUSE) === */}
        {activeTab === "stock" && hasPermission(["warehouse", "manager"]) && (
          <div className="panel fade-in">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <h2>📦 Управління Складом</h2>
                <button className="action-btn" onClick={fetchStock}>🔄 Оновити</button>
            </div>
            
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Інв.</th>
                    <th>Товар</th>
                    <th>Категорія</th>
                    <th>Сектор складу</th>
                    <th>Постачальник</th>
                    <th>Кількість</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((item) => (
                    <tr key={item.inventory_id}>
                      <td>{item.inventory_id}</td>
                      <td><strong>{item.product_name}</strong></td>
                      <td>{item.category}</td>
                      <td>{item.location}</td>
                      <td>{item.supplier_name || "—"}</td>
                      <td style={{fontWeight: "bold"}}>{item.quantity} шт.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* === ВЕТЕРИНАР === */}
        {activeTab === "vet" && hasPermission(["veterinarian"]) && (
          <div className="panel fade-in">
            <h2>🩺 Заявки від клієнтів</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Клієнт</th>
                    <th>Тип</th>
                    <th>Опис</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {vetRequests.map((req) => (
                    <tr key={req.id}>
                      <td>#{req.id}</td>
                      <td>{req.clientName}</td>
                      <td>{req.type}</td>
                      <td>{req.desc}</td>
                      <td>{req.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* === HR === */}
        {activeTab === "hr" && hasPermission(["manager"]) && (
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
                        <option value="Ветеринар">Ветеринар</option>
                        <option value="Комірник">Комірник</option>
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
    </div>
  );
};

export default WorkerDashboard;