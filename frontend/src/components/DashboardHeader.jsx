function DashboardHeader({
  backendStatus,
  currentUser,
  eyebrow,
  title,
  description,
  onLogout,
}) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
      </div>

      <div className="header-actions">
        {currentUser && (
          <div className="user-chip">
            <span>{currentUser.name?.charAt(0).toUpperCase() || "U"}</span>

            <div>
              <strong>{currentUser.name}</strong>
              <p>{currentUser.email}</p>
            </div>
          </div>
        )}

        <span
          className={`backend-status ${
            backendStatus === "connected" ? "connected" : "offline"
          }`}
        >
          {backendStatus === "connected"
            ? "Backend Connected"
            : "Backend Offline"}
        </span>

        <button className="logout-button" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
