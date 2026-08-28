import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  CheckSquare, 
  Clock, 
  PieChart, 
  Loader2, 
  Users2, 
  Eye, 
  Power, 
  Play, 
  Activity, 
  Pause, 
  CalendarClock,
  TrendingUp,
  Award,
  ChevronRight,
  Shield,
  Sparkles,
  Timer
} from "lucide-react";
import Card from "../../components/Card";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import { getAdminDashboard, createElection, startElection, stopElection, rescheduleElection } from "../../api/admin";

function localDateTime(value) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const STAT_CARDS = [
  { key: "eligibleStudents", label: "Total Eligible Students", icon: Users, color: "from-aces-purple-500 to-aces-purple-600", bg: "bg-aces-purple-50" },
  { key: "votesCast", label: "Votes Cast", icon: CheckSquare, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50" },
  { key: "remaining", label: "Remaining Students", icon: Clock, color: "from-amber-500 to-amber-600", bg: "bg-amber-50" },
];

function timeAgo(dateStr) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatusBadge({ status }) {
  const configs = {
    LIVE: {
      bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: <Sparkles className="h-3 w-3 animate-pulse" />,
      label: "● LIVE"
    },
    SCHEDULED: {
      bg: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <Timer className="h-3 w-3" />,
      label: "SCHEDULED"
    },
    ENDED: {
      bg: "bg-aces-purple-100 text-aces-purple-700 border-aces-purple-200",
      icon: <Award className="h-3 w-3" />,
      label: "ENDED"
    },
    PAUSED: {
      bg: "bg-red-100 text-red-700 border-red-200",
      icon: <Pause className="h-3 w-3" />,
      label: "PAUSED"
    }
  };

  const config = configs[status] || {
    bg: "bg-gray-100 text-gray-700 border-gray-200",
    icon: null,
    label: status?.replaceAll("_", " ")
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-bold ${config.bg}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newElection, setNewElection] = useState({ name: "", department: "Computer Engineering", startAt: "", endAt: "" });
  const [schedule, setSchedule] = useState({ startAt: "", endAt: "" });

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (data?.election) setSchedule({ startAt: localDateTime(data.election.startAt), endAt: localDateTime(data.election.endAt) });
  }, [data?.election?.id]);

  async function handleStartElection() {
    setStarting(true);
    setError("");
    try {
      const updatedElection = await startElection(data.election.id);
      setData((current) => ({ ...current, election: { ...current.election, ...updatedElection } }));
    } catch (e) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  }

  async function handleStopElection() {
    setStopping(true);
    setError("");
    try {
      const updatedElection = await stopElection(data.election.id);
      setData((current) => ({ ...current, election: { ...current.election, ...updatedElection } }));
    } catch (e) {
      setError(e.message);
    } finally {
      setStopping(false);
    }
  }

  async function handleReschedule() {
    setRescheduling(true);
    setError("");
    try {
      const updatedElection = await rescheduleElection(data.election.id, new Date(schedule.startAt).toISOString(), new Date(schedule.endAt).toISOString());
      setData((current) => ({ ...current, election: { ...current.election, ...updatedElection } }));
    } catch (e) {
      setError(e.message);
    } finally {
      setRescheduling(false);
    }
  }

  async function handleCreateElection() {
    setCreating(true);
    setError("");
    try {
      const election = await createElection({ ...newElection, startAt: new Date(newElection.startAt).toISOString(), endAt: new Date(newElection.endAt).toISOString() });
      setData((current) => ({ ...current, election: { id: election._id, name: election.name, status: election.status, startAt: election.startAt, endAt: election.endAt } }));
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-aces-purple-500">
        <Loader2 className="h-12 w-12 animate-spin text-aces-purple-400" />
        <p className="mt-4 text-sm font-medium text-aces-purple-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) return (
    <Alert type="error" className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <span className="font-medium text-red-800">{error}</span>
      </div>
    </Alert>
  );

  const { election, stats, recentActivity } = data;
  
  if (!election) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-aces-purple-100 to-aces-purple-200">
            <CalendarClock className="h-8 w-8 text-aces-purple-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-aces-purple-900">Schedule an Election</h1>
          <p className="mt-2 text-sm text-aces-purple-500">
            Create the election before adding positions, candidates, and voter tokens.
          </p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <Card className="border-0 shadow-xl shadow-aces-purple-200/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aces-purple-400 via-aces-purple-600 to-aces-purple-800" />
          <div className="p-6 md:p-8">
            <h3 className="mb-6 text-lg font-bold text-aces-purple-900">Election Details</h3>
            <form className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-aces-purple-700">Election Name</label>
                <input
                  value={newElection.name}
                  onChange={(e) => setNewElection((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Enter election name"
                  className="w-full rounded-xl border-2 border-aces-purple-200 px-4 py-2.5 text-sm text-aces-purple-900 placeholder:text-aces-purple-400 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-aces-purple-700">Department</label>
                <input
                  value={newElection.department}
                  onChange={(e) => setNewElection((s) => ({ ...s, department: e.target.value }))}
                  className="w-full rounded-xl border-2 border-aces-purple-200 px-4 py-2.5 text-sm text-aces-purple-900 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-aces-purple-700">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newElection.startAt}
                    onChange={(e) => setNewElection((s) => ({ ...s, startAt: e.target.value }))}
                    className="w-full rounded-xl border-2 border-aces-purple-200 px-4 py-2.5 text-sm text-aces-purple-900 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-aces-purple-700">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newElection.endAt}
                    onChange={(e) => setNewElection((s) => ({ ...s, endAt: e.target.value }))}
                    className="w-full rounded-xl border-2 border-aces-purple-200 px-4 py-2.5 text-sm text-aces-purple-900 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateElection}
                disabled={creating || !newElection.name || !newElection.startAt || !newElection.endAt}
                className="w-full bg-gradient-to-r from-aces-purple-600 to-aces-purple-700 py-3 text-white shadow-lg shadow-aces-purple-200/50 hover:from-aces-purple-700 hover:to-aces-purple-800"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                Schedule Election
              </Button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  const participation = Math.round(stats.participationPercent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-aces-purple-50 to-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-aces-purple-900">Dashboard Overview</h1>
          <p className="text-sm text-aces-purple-500">{election?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={election?.status} />
          <span className="text-xs text-aces-purple-400">
            <Shield className="inline h-3 w-3 mr-1" />
            Admin Access
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="group rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 bg-gradient-to-r ${color} bg-clip-text text-transparent`} />
            </div>
            <p className="text-2xl font-extrabold text-aces-purple-900">{stats[key]}</p>
            <p className="text-xs font-medium text-aces-purple-400">{label}</p>
          </div>
        ))}
        
        {/* Participation Card */}
        <div className="group rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-aces-gold-400/20 to-aces-gold-500/20">
            <PieChart className="h-5 w-5 text-aces-gold-600" />
          </div>
          <p className="text-2xl font-extrabold text-aces-purple-900">{participation}%</p>
          <p className="text-xs font-medium text-aces-purple-400">Participation Rate</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Election Status */}
        <Card className="lg:col-span-2 border-0 shadow-xl shadow-aces-purple-200/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aces-purple-400 via-aces-purple-600 to-aces-purple-800" />
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-aces-purple-900">Election Status</h3>
              <TrendingUp className="h-4 w-4 text-aces-purple-400" />
            </div>

            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-aces-purple-50/50 p-4">
                <dt className="text-xs font-medium text-aces-purple-500">Election Start</dt>
                <dd className="mt-1 font-semibold text-aces-purple-900">
                  {election?.startAt ? new Date(election.startAt).toLocaleString("en-IN") : "—"}
                </dd>
              </div>
              <div className="rounded-xl bg-aces-purple-50/50 p-4">
                <dt className="text-xs font-medium text-aces-purple-500">Election End</dt>
                <dd className="mt-1 font-semibold text-aces-purple-900">
                  {election?.endAt ? new Date(election.endAt).toLocaleString("en-IN") : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-aces-purple-500">
                <span>Participation Progress</span>
                <span className="text-aces-purple-900">{participation}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-aces-purple-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-aces-purple-400 to-aces-purple-600 transition-all duration-1000"
                  style={{ width: `${participation}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl shadow-aces-purple-200/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aces-gold-400 via-aces-gold-500 to-aces-gold-400" />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-aces-gold-500" />
              <h3 className="text-lg font-bold text-aces-purple-900">Quick Actions</h3>
            </div>

            <div className="space-y-3">
              {(election?.status === "SCHEDULED" || election?.status === "PAUSED") && (
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 hover:from-emerald-600 hover:to-emerald-700"
                  onClick={handleStartElection}
                  disabled={starting}
                >
                  {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {election.status === "PAUSED" ? "Resume Election" : "Open Election"}
                </Button>
              )}

              {election?.status === "LIVE" && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleStopElection}
                  disabled={stopping}
                >
                  {stopping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />}
                  Stop Temporarily
                </Button>
              )}

              {(election?.status === "SCHEDULED" || election?.status === "PAUSED") && (
                <div className="space-y-3 rounded-xl border-2 border-aces-purple-200 bg-aces-purple-50/30 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                    <CalendarClock className="h-4 w-4 text-aces-purple-500" />
                    Reschedule Voting
                  </p>
                  <input
                    type="datetime-local"
                    value={schedule.startAt}
                    onChange={(e) => setSchedule((s) => ({ ...s, startAt: e.target.value }))}
                    className="w-full rounded-lg border border-aces-purple-200 bg-white px-3 py-2 text-sm text-aces-purple-900 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                  />
                  <input
                    type="datetime-local"
                    value={schedule.endAt}
                    onChange={(e) => setSchedule((s) => ({ ...s, endAt: e.target.value }))}
                    className="w-full rounded-lg border border-aces-purple-200 bg-white px-3 py-2 text-sm text-aces-purple-900 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="w-full bg-aces-purple-600 text-white hover:bg-aces-purple-700"
                    onClick={handleReschedule}
                    disabled={rescheduling || !schedule.startAt || !schedule.endAt}
                  >
                    {rescheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                    Save Schedule
                  </Button>
                </div>
              )}

              <Link
                to="/admin/candidates"
                className="flex items-center justify-between rounded-xl border-2 border-aces-purple-200 px-4 py-3 text-sm font-medium text-aces-purple-700 transition-all hover:bg-aces-purple-50 hover:border-aces-purple-300"
              >
                <span className="flex items-center gap-3">
                  <Users2 className="h-4 w-4" />
                  Manage Candidates
                </span>
                <ChevronRight className="h-4 w-4 text-aces-purple-400" />
              </Link>

              <Link
                to="/admin/tokens"
                className="flex items-center justify-between rounded-xl border-2 border-aces-purple-200 px-4 py-3 text-sm font-medium text-aces-purple-700 transition-all hover:bg-aces-purple-50 hover:border-aces-purple-300"
              >
                <span className="flex items-center gap-3">
                  <Eye className="h-4 w-4" />
                  View Participation
                </span>
                <ChevronRight className="h-4 w-4 text-aces-purple-400" />
              </Link>

              {election?.status === "LIVE" && (
                <Link
                  to="/admin/end-election"
                  className="flex items-center justify-between rounded-xl border-2 border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:border-red-300"
                >
                  <span className="flex items-center gap-3">
                    <Power className="h-4 w-4" />
                    End Election
                  </span>
                  <ChevronRight className="h-4 w-4 text-red-400" />
                </Link>
              )}

              {election?.status === "ENDED" && (
                <div className="rounded-xl bg-aces-purple-50 px-4 py-3 text-center text-sm font-medium text-aces-purple-400">
                  Election has ended.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-xl shadow-aces-purple-200/30">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aces-purple-400 via-aces-purple-600 to-aces-purple-800" />
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-aces-purple-500" />
              <h3 className="text-lg font-bold text-aces-purple-900">Recent Activities</h3>
            </div>
            <span className="text-xs text-aces-purple-400">Latest updates</span>
          </div>

          {recentActivity?.length ? (
            <ul className="divide-y divide-aces-purple-50">
              {recentActivity.slice(0, 8).map((log) => (
                <li key={log._id} className="flex items-center justify-between py-3 transition-all hover:bg-aces-purple-50/50 px-3 rounded-lg -mx-3">
                  <span className="text-sm text-aces-purple-700">{log.description}</span>
                  <span className="shrink-0 text-xs font-medium text-aces-purple-400 bg-aces-purple-50 px-2 py-1 rounded-full">
                    {timeAgo(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center">
              <Activity className="mx-auto h-8 w-8 text-aces-purple-300" />
              <p className="mt-2 text-sm italic text-aces-purple-400">No recent activity yet.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}