import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Dashboard",
    path: "/",
  },
  {
    label: "Assistant",
    path: "/assistant",
  },
  {
    label: "Products",
    path: "/products",
  },
  {
    label: "Orders",
    path: "/orders",
  },
  {
    label: "Forecasts",
    path: "/forecasts",
  },
  {
    label: "Recommendations",
    path: "/recommendations",
  },
];

function Sidebar() {
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
          <NavLink
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            end={item.path === "/"}
            key={item.path}
            to={item.path}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
