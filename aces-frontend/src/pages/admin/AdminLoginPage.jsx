import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-aces-purple-950 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-aces-gold-400 text-aces-purple-900">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="font-display text-xl font-bold">Administrator Login</h1>
          <p className="mt-1 text-sm text-aces-purple-300">Sign in to access the ACES admin panel</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-aces-purple-800">Username</span>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-lg border border-aces-purple-200 bg-white px-3 py-2.5 text-sm text-aces-purple-900 placeholder:text-aces-purple-300 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-aces-purple-800">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-aces-purple-200 bg-white px-3 py-2.5 pr-10 text-sm text-aces-purple-900 placeholder:text-aces-purple-300 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-aces-purple-300 hover:text-aces-purple-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {error && <Alert type="error">{error}</Alert>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Login <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
