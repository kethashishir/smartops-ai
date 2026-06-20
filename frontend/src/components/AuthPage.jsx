function AuthPage({
  authMode,
  setAuthMode,
  authForm,
  authError,
  authSuccess,
  loadingAuth,
  onAuthInputChange,
  onSubmitAuth,
}) {
  const isRegisterMode = authMode === "register";

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon">S</div>
          <div>
            <h1>SmartOps AI</h1>
            <p>Retail operations intelligence dashboard</p>
          </div>
        </div>

        <h2>{isRegisterMode ? "Create your account" : "Welcome back"}</h2>
        <p className="auth-description">
          {isRegisterMode
            ? "Register to access inventory, forecasting, and recommendations."
            : "Log in to access your SmartOps AI dashboard."}
        </p>

        {authError && <p className="error">{authError}</p>}
        {authSuccess && <p className="success">{authSuccess}</p>}

        <form className="auth-form" onSubmit={onSubmitAuth}>
          {isRegisterMode && (
            <label>
              Name
              <input
                type="text"
                name="name"
                placeholder="Demo User"
                value={authForm.name}
                onChange={onAuthInputChange}
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              placeholder="demo@smartops.ai"
              value={authForm.email}
              onChange={onAuthInputChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={authForm.password}
              onChange={onAuthInputChange}
              required
            />
          </label>

          <button type="submit" disabled={loadingAuth}>
            {loadingAuth
              ? "Please wait..."
              : isRegisterMode
                ? "Create Account"
                : "Log In"}
          </button>
        </form>

        <button
          className="auth-toggle"
          type="button"
          onClick={() => setAuthMode(isRegisterMode ? "login" : "register")}
        >
          {isRegisterMode
            ? "Already have an account? Log in"
            : "Need an account? Register"}
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
