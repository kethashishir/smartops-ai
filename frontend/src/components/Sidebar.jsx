function Sidebar({ activeSection, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">S</div>
        <div>
          <h2>SmartOps</h2>
          <p>AI Operations</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${
            activeSection === "dashboard" ? "active" : ""
          }`}
          onClick={() => onNavigate("dashboard-overview", "dashboard")}
        >
          Dashboard
        </button>

        <button
          className={`sidebar-link ${
            activeSection === "products" ? "active" : ""
          }`}
          onClick={() => onNavigate("products-section", "products")}
        >
          Products
        </button>

        <button
          className={`sidebar-link ${
            activeSection === "orders" ? "active" : ""
          }`}
          onClick={() => onNavigate("orders-section", "orders")}
        >
          Orders
        </button>

        <button
          className={`sidebar-link ${
            activeSection === "forecasts" ? "active" : ""
          }`}
          onClick={() => onNavigate("forecasts-section", "forecasts")}
        >
          Forecasts
        </button>

        <button
          className={`sidebar-link ${
            activeSection === "recommendations" ? "active" : ""
          }`}
          onClick={() =>
            onNavigate("recommendations-section", "recommendations")
          }
        >
          Recommendations
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
