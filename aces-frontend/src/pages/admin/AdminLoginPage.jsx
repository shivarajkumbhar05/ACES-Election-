import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight,
  Shield,
  User,
  Key,
  CheckCircle2,
  Heart,
  Code
} from "lucide-react";
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
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-aces-purple-50 via-white to-aces-purple-50 px-4 py-10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-aces-purple-200/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-aces-purple-100/30 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-aces-purple-200/20 blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 inline-block">
            <div className="absolute inset-0 rounded-2xl bg-aces-purple-200/50 blur-xl animate-pulse" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-aces-purple-600 to-aces-purple-800 text-white shadow-2xl shadow-aces-purple-300/50">
              <Shield className="h-8 w-8" />
            </div>
            <div className="absolute -top-1 -right-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-white shadow-lg">
                <CheckCircle2 className="h-3 w-3" />
              </span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-aces-purple-900 tracking-tight">
            Admin Access
          </h1>
          <p className="mt-2 text-sm text-aces-purple-600">
            Secure login for authorized administrators only
          </p>
          
          {/* Security Badge */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-aces-purple-100/80 px-3 py-1 backdrop-blur-sm border border-aces-purple-200">
            <Shield className="h-3 w-3 text-aces-purple-600" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-aces-purple-600">
              Secure Connection
            </span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="relative overflow-hidden border-0 bg-white shadow-2xl shadow-aces-purple-200/50">
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aces-purple-400 via-aces-purple-600 to-aces-purple-400" />
          
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-aces-purple-50/50 to-transparent pointer-events-none" />

          <div className="relative p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                  <User className="h-4 w-4" />
                  Username
                </label>
                <div className={`relative transition-all duration-300 ${
                  focusedField === 'username' ? 'scale-[1.02]' : ''
                }`}>
                  <input
                    autoFocus
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your username"
                    className={`w-full rounded-xl border-2 bg-white px-4 py-3 pl-11 text-sm text-aces-purple-900 placeholder:text-aces-purple-400 transition-all duration-300 outline-none ${
                      focusedField === 'username'
                        ? 'border-aces-purple-500 shadow-lg shadow-aces-purple-200/50'
                        : 'border-aces-purple-200 hover:border-aces-purple-300'
                    }`}
                  />
                  <User className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'username' ? 'text-aces-purple-600' : 'text-aces-purple-400'
                  }`} />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                  <Key className="h-4 w-4" />
                  Password
                </label>
                <div className={`relative transition-all duration-300 ${
                  focusedField === 'password' ? 'scale-[1.02]' : ''
                }`}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    className={`w-full rounded-xl border-2 bg-white px-4 py-3 pl-11 pr-12 text-sm text-aces-purple-900 placeholder:text-aces-purple-400 transition-all duration-300 outline-none ${
                      focusedField === 'password'
                        ? 'border-aces-purple-500 shadow-lg shadow-aces-purple-200/50'
                        : 'border-aces-purple-200 hover:border-aces-purple-300'
                    }`}
                  />
                  <Key className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-aces-purple-600' : 'text-aces-purple-400'
                  }`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-aces-purple-400 transition-colors hover:bg-aces-purple-100 hover:text-aces-purple-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="animate-slideDown">
                  <Alert type="error" className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-red-500/20 p-1">
                        <span className="text-red-600 text-sm">⚠️</span>
                      </div>
                      <span className="text-sm font-medium text-red-800">{error}</span>
                    </div>
                  </Alert>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                size="lg"
                className="relative w-full overflow-hidden bg-gradient-to-r from-aces-purple-600 via-aces-purple-700 to-aces-purple-800 py-3.5 text-white shadow-lg shadow-aces-purple-300/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-aces-purple-300/60 disabled:opacity-70 disabled:hover:scale-100 group"
                disabled={loading || !username.trim() || !password.trim()}
              >
                <span className="absolute inset-0 overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </span>
                <span className="relative flex items-center justify-center gap-3 font-bold">
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Login to Dashboard</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>

              {/* Helper Text */}
              <div className="mt-4 text-center">
                <p className="text-xs text-aces-purple-400">
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Protected by ACES Security
                  </span>
                  <span className="mx-2">•</span>
                  <span>v2.0.1</span>
                </p>
              </div>
            </form>
          </div>
        </Card>

        {/* Developer Footer */}
        <div className="mt-8">
          {/* Decorative divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-aces-purple-200/50"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 py-1 text-[10px] font-medium uppercase tracking-widest text-aces-purple-400">
                <Heart className="inline h-3 w-3 text-rose-400" /> Developer <Heart className="inline h-3 w-3 text-rose-400" />
              </span>
            </div>
          </div>

          {/* Developer Info */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2 rounded-full bg-aces-purple-50/80 px-4 py-2 backdrop-blur-sm border border-aces-purple-200">
              <Code className="h-3.5 w-3.5 text-aces-purple-600" />
              <span className="text-xs font-medium text-aces-purple-600">
                Developed by
              </span>
              <span className="h-4 w-px bg-aces-purple-300"></span>
              <span className="text-xs font-semibold text-aces-purple-900">
                Shivraj Shrishail Kumbhar
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-[10px] text-aces-purple-400">
              <span>© {new Date().getFullYear()} ACES Election Portal</span>
              <span className="text-aces-purple-300">•</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}