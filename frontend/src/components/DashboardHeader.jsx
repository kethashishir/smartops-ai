function DashboardHeader({ backendStatus, currentUser, onLogout }) {
  return (
    <header id="dashboard-overview" className="app-header">
      <div>
        <p className="eyebrow">Operations Dashboard</p>
        <h1>SmartOps AI</h1>
        <p className="subtitle">
          Monitor inventory health, stock levels, and reorder recommendations.
        </p>
      </div>

      <div className="header-actions">
        {currentUser && (
          <div className="user-chip">
            <span>{currentUser.name?.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{currentUser.name}</strong>
              <p>{currentUser.email}</p>
            </div>
          </div>
        )}

        <p className={`backend-status ${backendStatus}`}>
          Backend{" "}
          {backendStatus === "checking"
            ? "Checking..."
            : backendStatus === "connected"
              ? "Connected"
              : "Offline"}
        </p>

        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
