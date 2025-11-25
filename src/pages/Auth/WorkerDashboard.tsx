import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WorkerDashboard.css";

interface Employee {
  id: number;
  name: string;
  work_email: string;
  role: "admin" | "manager" | "veterinarian" | "warehouse" | "cashier";
}

// Типи даних для різних ролей
interface VetRequest {
  id: number;
  clientName: string;
  type: string;
  desc: string;
  date: string;
  status: "New" | "Done";
}

interface StockItem {
  id: number;
  product: string;
  warehouseId: string;
  supplier: string;
  qty: number;
}

interface ScheduleItem {
  day: string;
  staff: string;
  shift: string;
}

const WorkerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  
  // State для даних (симуляція)
  const [vetRequests, setVetRequests] = useState<VetRequest[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const stored = sessionStorage.getItem("employee");
    if (!stored) {
      navigate("/login");
      return;
    }
    const parsedEmp = JSON.parse(stored);
    setEmployee(parsedEmp);

    // 📥 ЗАВАНТАЖЕННЯ ДАНИХ (Симуляція отримання з БД або localStorage)
    
    // 1. Заявки ветеринара (беремо з localStorage, куди пише Contact.tsx)
    const storedRequests = localStorage.getItem("vet_requests_db");
    if (storedRequests) {
      setVetRequests(JSON.parse(storedRequests));
    } else {
      // Демо-дані, якщо пусто
      setVetRequests([
        { id: 101, clientName: "Олена", type: "consultation", desc: "Котик чхає", date: "2023-10-25", status: "New" },
        { id: 102, clientName: "Іван", type: "nutrition", desc: "Корм для мопса", date: "2023-10-26", status: "Done" }
      ]);
    }

    // 2. Склад
    setStock([
      { id: 1, product: "Royal Canin 5kg", warehouseId: "A-12", supplier: "PetFood Ltd", qty: 45 },
      { id: 2, product: "Нашийник шкіряний", warehouseId: "B-03", supplier: "ZooGear", qty: 120 },
      { id: 3, product: "Клітка для папуги", warehouseId: "C-55", supplier: "BirdWorld", qty: 8 },
    ]);

    // 3. Розклад (Менеджер)
    setSchedule([
      { day: "Понеділок", staff: "Andriw (Касир)", shift: "08:00 - 16:00" },
      { day: "Понеділок", staff: "Dr. House (Вет)", shift: "10:00 - 18:00" },
      { day: "Вівторок", staff: "Rasel (Менеджер)", shift: "09:00 - 17:00" },
    ]);

  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("employee");
    // Очищаємо user storage теж, про всяк випадок
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const hasPermission = (roles: string[]) => {
    if (!employee) return false;
    return roles.includes(employee.role) || employee.role === "admin";
  };

  if (!employee) return <div className="loading-screen">Завантаження кабінету...</div>;

  return (
    <div className="dashboard-container">
      {/* САЙДБАР */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="avatar">{employee.name.charAt(0)}</div>
          <h3>{employee.name}</h3>
          <span className={`role-badge ${employee.role}`}>{employee.role}</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={activeTab === "overview" ? "active" : ""} 
            onClick={() => setActiveTab("overview")}
          >
            🏠 Огляд
          </button>

          {(hasPermission(["veterinarian"])) && (
            <button 
              className={activeTab === "vet" ? "active" : ""} 
              onClick={() => setActiveTab("vet")}
            >
              🩺 Заявки (Вет)
              {vetRequests.filter(r => r.status === "New").length > 0 && 
                <span className="count-badge">{vetRequests.filter(r => r.status === "New").length}</span>
              }
            </button>
          )}

          {(hasPermission(["warehouse", "manager"])) && (
            <button 
              className={activeTab === "stock" ? "active" : ""} 
              onClick={() => setActiveTab("stock")}
            >
              📦 Склад і Товари
            </button>
          )}

          {(hasPermission(["manager"])) && (
            <button 
              className={activeTab === "hr" ? "active" : ""} 
              onClick={() => setActiveTab("hr")}
            >
              👥 Персонал і Графік
            </button>
          )}

          {/* 👇 Кнопка переходу в Адмін Панель (Тільки для Адміна) */}
          {employee.role === "admin" && (
            <button 
              className="admin-link-btn" 
              onClick={() => navigate("/admin-panel")}
              style={{ color: "#ffc107", fontWeight: "bold" }}
            >
              🛠️ Адмін Панель
            </button>
          )}
        </nav>

        <button className="logout-btn-dash" onClick={handleLogout}>🚪 Вийти</button>
      </aside>

      {/* ОСНОВНИЙ КОНТЕНТ */}
      <main className="dashboard-content">
        
        {/* === ОГЛЯД === */}
        {activeTab === "overview" && (
          <div className="panel fade-in">
            <h1>👋 Вітаємо у робочому просторі!</h1>
            <p>Ваша роль: <strong>{employee.role.toUpperCase()}</strong></p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h4>📅 Дата</h4>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
              {(employee.role === "admin" || employee.role === "manager") && (
                <div className="stat-card info">
                  <h4>👥 Працівників</h4>
                  <p>12 активних</p>
                </div>
              )}
              {(employee.role === "veterinarian" || employee.role === "admin") && (
                <div className="stat-card warning">
                  <h4>🩺 Нових заявок</h4>
                  <p>{vetRequests.filter(r => r.status === "New").length}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === ВЕТЕРИНАР === */}
        {activeTab === "vet" && hasPermission(["veterinarian"]) && (
          <div className="panel fade-in">
            <h2>🩺 Заявки від клієнтів</h2>
            <p>Список запитів на консультацію та діагностику.</p>
            
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Клієнт</th>
                    <th>Тип послуги</th>
                    <th>Опис проблеми</th>
                    <th>Дата</th>
                    <th>Статус</th>
                    <th>Дія</th>
                  </tr>
                </thead>
                <tbody>
                  {vetRequests.map((req) => (
                    <tr key={req.id}>
                      <td>#{req.id}</td>
                      <td>{req.clientName}</td>
                      <td>
                        <span className={`type-badge ${req.type}`}>
                          {req.type === "consultation" ? "Консультація" : req.type === "diagnosis" ? "Діагностика" : "Харчування"}
                        </span>
                      </td>
                      <td>{req.desc}</td>
                      <td>{req.date}</td>
                      <td>
                        <span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span>
                      </td>
                      <td>
                        <button className="action-btn">Відкрити</button>
                      </td>
                    </tr>
                  ))}
                  {vetRequests.length === 0 && <tr><td colSpan={7}>Заявок немає 🎉</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === СКЛАД (WAREHOUSE) === */}
        {activeTab === "stock" && hasPermission(["warehouse", "manager"]) && (
          <div className="panel fade-in">
            <h2>📦 Управління Складом</h2>
            <div className="toolbar">
                <input type="text" placeholder="Пошук товару..." className="search-input" />
                <button className="primary-btn">➕ Прийняти товар</button>
            </div>
            
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Товар</th>
                    <th>Сектор складу</th>
                    <th>Постачальник (Manager)</th>
                    <th>Кількість</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td><strong>{item.product}</strong></td>
                      <td>{item.warehouseId}</td>
                      <td>
                        {hasPermission(["manager"]) ? item.supplier : <span className="blur-text">Приховано</span>}
                      </td>
                      <td>{item.qty} шт.</td>
                      <td>
                        {item.qty < 10 ? <span className="low-stock">⚠️ Мало</span> : <span className="in-stock">✅ Є</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === МЕНЕДЖЕР (HR) === */}
        {activeTab === "hr" && hasPermission(["manager"]) && (
          <div className="panel fade-in">
            <h2>👥 Управління персоналом</h2>
            
            <div className="hr-actions">
               <div className="card-action">
                 <h3>Додати працівника</h3>
                 <p>Створити новий обліковий запис для персоналу.</p>
                 <button className="primary-btn">➕ Створити профіль</button>
               </div>
               <div className="card-action">
                 <h3>Звіти</h3>
                 <p>Переглянути фінансові звіти за місяць.</p>
                 <button className="secondary-btn">📊 Завантажити PDF</button>
               </div>
            </div>

            <h3>📅 Графік роботи</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>День</th>
                  <th>Співробітник</th>
                  <th>Зміна</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((shift, idx) => (
                  <tr key={idx}>
                    <td>{shift.day}</td>
                    <td>{shift.staff}</td>
                    <td>{shift.shift}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
};

export default WorkerDashboard;