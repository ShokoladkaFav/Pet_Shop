
import React from "react";

interface VetRequest {
  id: number;
  client_name: string;
  email: string;
  type: string;
  description: string;
  status: "New" | "In Progress" | "Done" | "Cancelled";
  created_at: string;
}

interface Props {
  vetRequests: VetRequest[];
  handleVetRequestStatus: (id: number, newStatus: string) => void;
  confirmDeleteVetRequest: (id: number) => void;
  fetchVetRequests: () => void;
  translateVetType: (type: string) => string;
  parseDescription: (rawDesc: string) => any;
  getStatusColor: (status: string) => string;
}

const WorkerDashboard_Vet: React.FC<Props> = ({
  vetRequests,
  handleVetRequestStatus,
  confirmDeleteVetRequest,
  fetchVetRequests,
  translateVetType,
  parseDescription,
  getStatusColor
}) => {
  return (
    <div className="panel fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, color: "#0f172a" }}>🩺 Заявки від клієнтів</h2>
        <button className="action-btn" onClick={fetchVetRequests}>🔄 Оновити список</button>
      </div>

      <div className="table-responsive" style={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID / Дата</th>
              <th>Клієнт</th>
              <th>Послуга</th>
              <th style={{ width: "45%" }}>Деталі звернення</th>
              <th>Статус</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {vetRequests.map((req) => {
              const { text, meta, image } = parseDescription(req.description);
              const typeClass = req.type.toLowerCase();

              return (
                <tr key={req.id} className={req.status === 'Cancelled' ? 'row-cancelled' : ''}>
                  <td style={{ verticalAlign: "top" }}>
                    <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "1rem" }}>#{req.id}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ verticalAlign: "top" }}>
                    <div style={{ fontWeight: "700", color: "#0f172a" }}>{req.client_name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{req.email}</div>
                  </td>
                  <td style={{ verticalAlign: "top" }}>
                    <span className={`type-badge ${typeClass}`}>
                      {translateVetType(req.type)}
                    </span>
                  </td>
                  <td style={{ verticalAlign: "top" }}>
                    {meta.length > 0 && (
                      <div className="meta-tags-container">
                        {meta.map((m: any, idx: number) => (
                          <span key={idx} className="meta-tag">
                            <strong>{m.label}:</strong> {m.value}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="req-description-block">
                      {text || "Клієнт не надав текстового опису."}
                    </div>

                    {image && (
                      <div className="req-image-thumb">
                        <img src={image} alt="Зображення до заявки" onClick={() => {
                          const w = window.open("");
                          if(w) {
                            w.document.write(`
                              <body style="margin:0; background:#000; display:flex; align-items:center; justify-content:center; height:100vh;">
                                <img src="${image}" style="max-width:100%; max-height:100%; object-fit:contain;"/>
                              </body>
                            `);
                          }
                        }} />
                        <div style={{fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px"}}>📸 Клікніть для перегляду</div>
                      </div>
                    )}
                  </td>
                  <td style={{ verticalAlign: "top" }}>
                    <select
                      value={req.status}
                      onChange={(e) => handleVetRequestStatus(req.id, e.target.value)}
                      className="status-select"
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: `2px solid ${getStatusColor(req.status)}`,
                        fontWeight: "700",
                        color: getStatusColor(req.status),
                        fontSize: "0.85rem",
                        backgroundColor: "#fff",
                        cursor: "pointer"
                      }}
                    >
                      <option value="New">Нова</option>
                      <option value="In Progress">В роботі</option>
                      <option value="Done">Готово</option>
                      <option value="Cancelled">Скасовано</option>
                    </select>
                  </td>
                  <td style={{ verticalAlign: "top", textAlign: "right" }}>
                    <button
                      className="delete-icon-btn"
                      title="Видалити"
                      onClick={() => confirmDeleteVetRequest(req.id)}
                      style={{ padding: "10px", backgroundColor: "#fff5f5" }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
            {vetRequests.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🕊️</div>
                  Нових заявок наразі немає.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkerDashboard_Vet;
