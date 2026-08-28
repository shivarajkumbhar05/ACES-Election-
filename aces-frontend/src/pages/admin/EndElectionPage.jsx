import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Loader2, 
  Power,
  Shield,
  Lock,
  Key,
  XCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import { getCurrentElection } from "../../api/election";
import { endElection } from "../../api/admin";

export default function EndElectionPage() {
  const [election, setElection] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentElection()
      .then(setElection)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleEnd() {
    if (!password) {
      setError("Please enter the administrator password.");
      return;
    }
    if (!confirmChecked) {
      setError("Please confirm that you understand this action is irreversible.");
      return;
    }
    setEnding(true);
    setError("");
    try {
      await endElection(election.id, password);
      navigate("/admin/results");
    } catch (e) {
      setError(e.message);
    } finally {
      setEnding(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-aces-purple-500">
        <Loader2 className="h-12 w-12 animate-spin text-aces-purple-400" />
        <p className="mt-4 text-sm font-medium text-aces-purple-500">Loading election details...</p>
      </div>
    );
  }

  const isLive = election?.status === "LIVE";
  const isScheduled = election?.status === "SCHEDULED";
  const isEnded = election?.status === "ENDED";

  function getStatusInfo() {
    if (isLive) {
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        text: "Election is currently LIVE",
        color: "text-emerald-700",
        bg: "bg-emerald-50 border-emerald-200"
      };
    } else if (isScheduled) {
      return {
        icon: <Clock className="h-5 w-5 text-amber-500" />,
        text: "Election is SCHEDULED but not yet started",
        color: "text-amber-700",
        bg: "bg-amber-50 border-amber-200"
      };
    } else if (isEnded) {
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        text: "Election has already ENDED",
        color: "text-red-700",
        bg: "bg-red-50 border-red-200"
      };
    } else {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-gray-500" />,
        text: `Election status: ${election?.status?.replaceAll("_", " ") || "Unknown"}`,
        color: "text-gray-700",
        bg: "bg-gray-50 border-gray-200"
      };
    }
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200/50">
          <Power className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl font-bold text-aces-purple-900">End Election</h1>
        <p className="mt-2 text-sm text-aces-purple-500">
          This action will permanently close voting for all students.
        </p>
      </div>

      {/* Warning Card */}
      <Card className="relative overflow-hidden border-0 shadow-xl shadow-red-200/30">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-600" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 shadow-inner">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            
            <h3 className="mt-4 font-display text-xl font-bold text-aces-purple-900">
              Are you sure you want to end the ACES Election?
            </h3>
            <p className="mt-2 text-sm font-medium text-red-500">
              ⚠️ This action is irreversible and cannot be undone.
            </p>

            {/* Election Status */}
            <div className={`mt-4 w-full rounded-xl border-2 p-4 ${statusInfo.bg}`}>
              <div className="flex items-center gap-3">
                {statusInfo.icon}
                <span className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
              {election && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded bg-white/50 px-3 py-1.5 text-aces-purple-600">
                    <span className="font-medium">Election:</span> {election.name}
                  </div>
                  <div className="rounded bg-white/50 px-3 py-1.5 text-aces-purple-600">
                    <span className="font-medium">Department:</span> {election.department}
                  </div>
                </div>
              )}
            </div>

            {!isLive && (
              <Alert type="warning" className="mt-4 w-full border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-amber-500/20 p-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-amber-800">Cannot End Election</p>
                    <p className="text-xs text-amber-700">
                      Only a <strong>LIVE</strong> election can be ended. Current status:{" "}
                      <strong>{election?.status?.replaceAll("_", " ")}</strong>
                    </p>
                  </div>
                </div>
              </Alert>
            )}

            {/* Password Field */}
            <div className="mt-6 w-full">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                <Key className="h-4 w-4" />
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aces-purple-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full rounded-xl border-2 border-aces-purple-200 bg-white px-4 py-3 pl-10 pr-12 text-sm text-aces-purple-900 placeholder:text-aces-purple-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
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

            {/* Confirmation Checkbox */}
            <div className="mt-4 w-full">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-aces-purple-200 p-3 transition-all hover:border-red-300 hover:bg-red-50/50">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-2 border-aces-purple-300 text-red-600 focus:ring-2 focus:ring-red-200"
                />
                <div>
                  <p className="text-sm font-medium text-aces-purple-700">
                    I understand that this action is <span className="text-red-600">irreversible</span>
                  </p>
                  <p className="text-xs text-aces-purple-400">
                    All voting will be permanently closed and results will be finalized.
                  </p>
                </div>
              </label>
            </div>

            {error && (
              <Alert type="error" className="mt-4 w-full border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span className="text-sm font-medium text-red-800">{error}</span>
                </div>
              </Alert>
            )}

            {/* Buttons */}
            <div className="mt-6 flex w-full gap-3">
              <Button
                variant="outline"
                className="flex-1 border-2 border-aces-purple-200 text-aces-purple-600 hover:bg-aces-purple-50"
                onClick={() => navigate("/admin/dashboard")}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200/50 hover:from-red-600 hover:to-red-700 disabled:opacity-50"
                onClick={handleEnd}
                disabled={ending || !isLive || !password || !confirmChecked}
              >
                {ending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                End Election
              </Button>
            </div>

            {/* Security Note */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-aces-purple-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Administrator access required</span>
              <span className="text-aces-purple-300">•</span>
              <span>This action is logged</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}