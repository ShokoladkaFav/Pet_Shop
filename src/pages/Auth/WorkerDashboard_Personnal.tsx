
import React from "react";

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  work_email: string;
  position: string;
}

interface Props {
  allEmployees: Employee[];
  currentEmployeeId: number;
  setShowAddEmpModal: (val: boolean) => void;
  handleDeleteEmployee: (id: number) => void;
}

const WorkerDashboard_Personnal: React.FC<Props> = ({
  allEmployees,
  currentEmployeeId,
  setShowAddEmpModal,
  handleDeleteEmployee
}) => {
  return (
    <div className="panel fade-in">
      <div className="panel-header-dash">
        <h2>👥 Управління Персоналом</h2>
        <button className="primary-btn" onClick={() => setShowAddEmpModal(true)}>➕ Додати працівника</button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Прізвище та Ім'я</th>
              <th>Робочий Email</th>
              <th>Посада</th>
              <th style={{ textAlign: "right" }}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {allEmployees.map(emp => (
              <tr key={emp.employee_id}>
                <td style={{ color: "#64748b" }}>#{emp.employee_id}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ 
                      width: "32px", height: "32px", borderRadius: "50%", 
                      backgroundColor: "#e0f2fe", color: "#0369a1", 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.8rem", fontWeight: "bold"
                    }}>
                      {emp.first_name[0]}
                    </div>
                    <strong>{emp.last_name} {emp.first_name}</strong>
                  </div>
                </td>
                <td>{emp.work_email}</td>
                <td><span className="status-badge status-process">{emp.position}</span></td>
                <td style={{ textAlign: "right" }}>
                  {emp.employee_id !== currentEmployeeId ? (
                    <button className="delete-icon-btn" onClick={() => handleDeleteEmployee(emp.employee_id)}>
                      🗑️
                    </button>
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>Це Ви</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkerDashboard_Personnal;
