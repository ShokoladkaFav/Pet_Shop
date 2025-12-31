
import React from "react";

interface OrderItem {
  order_number: string;
  inventory_id: number;
  quantity: number;
  price: string | number;
  subtotal: string | number;
  status: string | null;
}

interface GroupedOrder {
  order_number: string;
  dateStr: string;
  status: string;
  total_price: number;
  items: OrderItem[];
}

interface Props {
  groupedOrders: GroupedOrder[];
  updatingOrder: string | null;
  handleOrderStatusChange: (orderNumber: string, newStatus: string) => void;
  confirmDeleteOrder: (orderNumber: string) => void;
  fetchOrders: () => void;
  getProductName: (invId: number) => string;
  getStatusColor: (status: string) => string;
}

const WorkerDashboard_Orders: React.FC<Props> = ({
  groupedOrders,
  updatingOrder,
  handleOrderStatusChange,
  confirmDeleteOrder,
  fetchOrders,
  getProductName,
  getStatusColor
}) => {
  return (
    <div className="panel fade-in">
      <div className="panel-header-dash">
        <h2>🛒 Управління Замовленнями</h2>
        <button className="action-btn" onClick={fetchOrders}>🔄 Оновити дані</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {groupedOrders.map((order) => (
          <div key={order.order_number} style={{
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: "white"
          }}>
            <div style={{ 
              padding: "20px", 
              backgroundColor: "#f8fafc", 
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0 }}>Замовлення #{order.order_number}</h3>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{order.dateStr}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <strong style={{ fontSize: "1.1rem" }}>{order.total_price.toFixed(2)} грн</strong>
                <select
                  value={order.status}
                  onChange={(e) => handleOrderStatusChange(order.order_number, e.target.value)}
                  disabled={updatingOrder === order.order_number}
                  style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: `2px solid ${getStatusColor(order.status)}`,
                    fontWeight: "bold",
                    color: getStatusColor(order.status)
                  }}
                >
                  <option value="New">Нове</option>
                  <option value="Processing">Обробка</option>
                  <option value="Sent">Відправлено</option>
                  <option value="Done">Виконано</option>
                  <option value="Cancelled">Скасовано</option>
                </select>
                <button className="delete-icon-btn" onClick={() => confirmDeleteOrder(order.order_number)}>🗑️</button>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Кількість</th>
                  <th style={{ textAlign: "right" }}>Сума</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{getProductName(item.inventory_id)}</td>
                    <td>{item.quantity} шт.</td>
                    <td style={{ textAlign: "right" }}>{Number(item.subtotal).toFixed(2)} ₴</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerDashboard_Orders;
