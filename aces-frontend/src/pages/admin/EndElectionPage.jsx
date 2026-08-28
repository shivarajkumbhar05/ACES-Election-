import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Eye, EyeOff, Loader2, Power } from "lucide-react";
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
      <div className="flex min-h-[40vh] items-center justify-center text-aces-purple-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  const isLive = election?.status === "LIVE";

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-aces-purple-900">End Election</h1>
        <p className="text-sm text-aces-purple-500">This closes voting permanently for all students.</p>
      </div>

      <Card bodyClassName="flex flex-col items-center py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-aces-purple-900">
          Are you sure you want to end the ACES Election?
        </h3>
        <p className="mt-1 text-sm text-red-500">This action is irreversible.</p>

        {!isLive && (
          <Alert type="warning" className="mt-4 w-full text-left">
            The election isn't currently live (status: {election?.status?.replaceAll("_", " ")}). Only a
            live election can be ended.
          </Alert>
        )}

        <label className="mt-5 block w-full text-left">
          <span className="mb-1.5 block text-sm font-semibold text-aces-purple-800">
            Enter Administrator Password
          </span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-aces-purple-200 px-3 py-2.5 pr-10 text-sm focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
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

        {error && <Alert type="error" className="mt-3 w-full text-left">{error}</Alert>}

        <div className="mt-6 flex w-full gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate("/admin/dashboard")}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleEnd} disabled={ending || !isLive}>
            {ending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
            Confirm & End Election
          </Button>
        </div>
      </Card>
    </div>
  );
}
