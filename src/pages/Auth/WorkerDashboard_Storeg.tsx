
import React from "react";

interface StockItem {
  inventory_id: number;
  product_name: string;
  category: string;
  location: string;
  supplier_name: string | null;
  quantity: number;
}

interface Props {
  processedStock: StockItem[];
  stockSearch: string;
  setStockSearch: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterLocation: string;
  setFilterLocation: (val: string) => void;
  filterSupplier: string;
  setFilterSupplier: (val: string) => void;
  uniqueCategories: string[];
  uniqueLocations: string[];
  uniqueSuppliers: string[];
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  handleSort: (key: any) => void;
  fetchStock: () => void;
}

const WorkerDashboard_Storeg: React.FC<Props> = ({
  processedStock,
  stockSearch,
  setStockSearch,
  filterCategory,
  setFilterCategory,
  filterLocation,
  setFilterLocation,
  filterSupplier,
  setFilterSupplier,
  uniqueCategories,
  uniqueLocations,
  uniqueSuppliers,
  sortConfig,
  handleSort,
  fetchStock
}) => {
  return (
    <div className="panel fade-in">
      <div className="panel-header-dash">
        <h2>📦 Управління Складом</h2>
        <button className="action-btn" onClick={fetchStock}>🔄 Оновити дані</button>
      </div>

      <div className="stock-controls">
        <input
          type="text"
          placeholder="🔍 Пошук за назвою..."
          value={stockSearch}
          onChange={(e) => setStockSearch(e.target.value)}
          className="stock-search-input"
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="stock-select">
          <option value="all">Усі категорії</option>
          {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="stock-select">
          <option value="all">Усі локації</option>
          {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} className="stock-select">
          <option value="all">Усі постачальники</option>
          {uniqueSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('inventory_id')} style={{cursor: "pointer"}}>ID</th>
              <th>Товар</th>
              <th>Категорія</th>
              <th>Локація</th>
              <th style={{ textAlign: "right" }}>Залишок</th>
            </tr>
          </thead>
          <tbody>
            {processedStock.map((item) => (
              <tr key={item.inventory_id}>
                <td>#{item.inventory_id}</td>
                <td><strong>{item.product_name}</strong></td>
                <td><span className="meta-tag">{item.category}</span></td>
                <td>{item.location}</td>
                <td style={{ textAlign: "right" }}>
                  <span className={`quantity-badge ${item.quantity < 10 ? 'low' : 'ok'}`}>
                    {item.quantity} шт.
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkerDashboard_Storeg;
