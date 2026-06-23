import { useState } from "react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isRegisterMode = authMode === "register";
  const passwordInputType = showPassword ? "text" : "password";
  const confirmPasswordInputType = showConfirmPassword ? "text" : "password";

  function handleModeToggle() {
    setShowPassword(false);
    setShowConfirmPassword(false);
    setAuthMode(isRegisterMode ? "login" : "register");
  }

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
            <div className="password-input-wrapper">
              <input
                type={passwordInputType}
                name="password"
                placeholder="Enter password"
                value={authForm.password}
                onChange={onAuthInputChange}
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {isRegisterMode && (
            <label>
              Confirm Password
              <div className="password-input-wrapper">
                <input
                  type={confirmPasswordInputType}
                  name="confirmPassword"
                  placeholder="Retype password"
                  value={authForm.confirmPassword}
                  onChange={onAuthInputChange}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((currentValue) => !currentValue)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          )}

          <button type="submit" disabled={loadingAuth}>
            {loadingAuth
              ? "Please wait..."
              : isRegisterMode
                ? "Create Account"
                : "Log In"}
          </button>
        </form>

        <button className="auth-toggle" type="button" onClick={handleModeToggle}>
          {isRegisterMode
            ? "Already have an account? Log in"
            : "Need an account? Register"}
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
