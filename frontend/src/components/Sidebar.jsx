const navItems = [
  {
    label: "Dashboard",
    section: "dashboard",
  },
  {
    label: "Assistant",
    section: "assistant",
  },
  {
    label: "Products",
    section: "products",
  },
  {
    label: "Orders",
    section: "orders",
  },
  {
    label: "Forecasts",
    section: "forecasts",
  },
  {
    label: "Recommendations",
    section: "recommendations",
  },
];

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
        {navItems.map((item) => (
          <button
            className={`sidebar-link ${
              activeSection === item.section ? "active" : ""
            }`}
            key={item.section}
            onClick={() => onNavigate(item.section)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
