function DashboardHeader({ backendStatus }) {
  return (
    <header id="dashboard-overview" className="app-header">
      <div>
        <p className="eyebrow">Operations Dashboard</p>
        <h1>SmartOps AI</h1>
        <p className="subtitle">
          Monitor inventory health, stock levels, and reorder recommendations.
        </p>
      </div>

      <p className={`backend-status ${backendStatus}`}>
        Backend{" "}
        {backendStatus === "checking"
          ? "Checking..."
          : backendStatus === "connected"
            ? "Connected"
            : "Offline"}
      </p>
    </header>
  );
}

export default DashboardHeader;
