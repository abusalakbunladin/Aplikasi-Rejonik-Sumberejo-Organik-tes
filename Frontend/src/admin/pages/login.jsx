import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth.js";
import { Button, Field, Input, Notice } from "../components/ui.jsx";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    const tujuan = location.state?.from?.pathname || "/admin";
    return <Navigate to={tujuan} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate(location.state?.from?.pathname || "/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Gagal masuk. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
        <p className="text-xl font-extrabold text-primary">Sumberejo Organik</p>
        <p className="mb-6 text-sm text-quaternary">Masuk ke panel admin</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Notice type="error">{error}</Notice>

          <Field label="Username">
            <Input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Memproses…" : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
