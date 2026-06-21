import { useEffect, useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "../api/authApi.js";
import { resetSessionExpiredDispatch } from "../api/config.js";

function useAuth({ onSessionReset }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  function handleAuthInputChange(event) {
    setAuthError("");
    setAuthSuccess("");

    const { name, value } = event.target;

    setAuthForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmitAuth(event) {
    event.preventDefault();

    try {
      setLoadingAuth(true);
      setAuthError("");
      setAuthSuccess("");

      if (authMode === "register") {
        await registerUser(authForm);

        setAuthSuccess("Account created successfully. You can now log in.");
        setAuthMode("login");
        setAuthForm({
          name: "",
          email: authForm.email,
          password: "",
        });

        return;
      }

      const data = await loginUser({
        email: authForm.email,
        password: authForm.password,
      });

      localStorage.setItem("smartops_token", data.access_token);
      resetSessionExpiredDispatch();

      if (onSessionReset) {
        onSessionReset();
      }

      setAuthError("");
      setAuthSuccess("");
      setCurrentUser(data.user);

      setAuthForm({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setAuthError(error.message || "Authentication failed.");
    } finally {
      setLoadingAuth(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("smartops_token");

    if (onSessionReset) {
      onSessionReset();
    }

    setCurrentUser(null);
  }

  useEffect(() => {
    function handleSessionExpired(event) {
      if (onSessionReset) {
        onSessionReset();
      }

      setCurrentUser(null);
      setAuthMode("login");
      setAuthError(
        event.detail?.message || "Session expired. Please log in again.",
      );
    }

    window.addEventListener("smartops:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener(
        "smartops:session-expired",
        handleSessionExpired,
      );
    };
  }, [onSessionReset]);

  useEffect(() => {
    async function restoreAuthSession() {
      const token = localStorage.getItem("smartops_token");

      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const user = await getCurrentUser(token);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error restoring auth session:", error.message);
        localStorage.removeItem("smartops_token");
        setCurrentUser(null);
      } finally {
        setCheckingAuth(false);
      }
    }

    restoreAuthSession();
  }, []);

  return {
    currentUser,
    authMode,
    setAuthMode,
    authForm,
    authError,
    authSuccess,
    loadingAuth,
    checkingAuth,
    handleAuthInputChange,
    handleSubmitAuth,
    handleLogout,
  };
}

export default useAuth;
