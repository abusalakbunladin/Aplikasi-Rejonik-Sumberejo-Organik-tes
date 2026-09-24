import { useEffect, useState, useCallback } from "react";
import { Navigate, useLocation } from "react-router-dom";
import * as api from "./api.js";
import { AuthContext } from "./authCtx.js";
import { useAuth } from "./useAuth.js";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => api.getToken());

  // Kalau ada request yang balas 401 (token kadaluarsa/tidak valid),
  // api.js akan menghapus token & memicu event ini supaya UI ikut logout.
  useEffect(() => {
    return api.onUnauthorized(() => setToken(null));
  }, []);

  const doLogin = useCallback(async (username, password) => {
    const data = await api.login(username, password);
    setToken(data.access_token);
    return data;
  }, []);

  const doLogout = useCallback(() => {
    api.logout();
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: Boolean(token), login: doLogin, logout: doLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return children;
}
