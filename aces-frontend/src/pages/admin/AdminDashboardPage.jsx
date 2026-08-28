import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, CheckSquare, Clock, PieChart, Loader2, Users2, Eye, Power, Play, Activity, Pause, CalendarClock } from "lucide-react";
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
  { key: "eligibleStudents", label: "Total Eligible Students", icon: Users, tone: "bg-aces-purple-50 text-aces-purple-700" },
  { key: "votesCast", label: "Votes Cast", icon: CheckSquare, tone: "bg-emerald-50 text-emerald-700" },
  { key: "remaining", label: "Remaining Students", icon: Clock, tone: "bg-amber-50 text-amber-700" },
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
      <div className="flex min-h-[40vh] items-center justify-center text-aces-purple-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading dashboard…
      </div>
    );
  }

  if (error) return <Alert type="error">{error}</Alert>;

  const { election, stats, recentActivity } = data;
  if (!election) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-aces-purple-900">Schedule an Election</h1>
          <p className="text-sm text-aces-purple-500">Create the election before adding positions, candidates, and voter tokens.</p>
        </div>
        {error && <Alert type="error">{error}</Alert>}
        <Card title="Election Schedule">
          <div className="space-y-4">
            <label className="block"><span className="mb-1 block text-xs font-semibold text-aces-purple-600">Election name</span><input value={newElection.name} onChange={(e) => setNewElection((s) => ({ ...s, name: e.target.value }))} className="w-full rounded-lg border border-aces-purple-200 px-3 py-2 text-sm" /></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-aces-purple-600">Department</span><input value={newElection.department} onChange={(e) => setNewElection((s) => ({ ...s, department: e.target.value }))} className="w-full rounded-lg border border-aces-purple-200 px-3 py-2 text-sm" /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1 block text-xs font-semibold text-aces-purple-600">Start</span><input type="datetime-local" value={newElection.startAt} onChange={(e) => setNewElection((s) => ({ ...s, startAt: e.target.value }))} className="w-full rounded-lg border border-aces-purple-200 px-3 py-2 text-sm" /></label><label className="block"><span className="mb-1 block text-xs font-semibold text-aces-purple-600">End</span><input type="datetime-local" value={newElection.endAt} onChange={(e) => setNewElection((s) => ({ ...s, endAt: e.target.value }))} className="w-full rounded-lg border border-aces-purple-200 px-3 py-2 text-sm" /></label></div>
            <Button onClick={handleCreateElection} disabled={creating || !newElection.name || !newElection.startAt || !newElection.endAt}>{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />} Schedule Election</Button>
          </div>
        </Card>
      </div>
    );
  }
  const participation = Math.round(stats.participationPercent);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-aces-purple-900">Admin Dashboard</h1>
          <p className="text-sm text-aces-purple-500">{election?.name}</p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            election?.status === "LIVE"
              ? "bg-emerald-100 text-emerald-700"
              : election?.status === "SCHEDULED"
                ? "bg-amber-100 text-amber-700"
                : "bg-aces-purple-100 text-aces-purple-700"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" /> {election?.status?.replaceAll("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, tone }) => (
          <div key={key} className="rounded-2xl bg-white p-5 shadow-card">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
              <Icon className="h-[18px] w-[18px]" />
            </div>
            <p className="text-2xl font-extrabold text-aces-purple-900">{stats[key]}</p>
            <p className="text-xs font-medium text-aces-purple-400">{label}</p>
          </div>
        ))}
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-aces-gold-400/20 text-aces-gold-600">
            <PieChart className="h-[18px] w-[18px]" />
          </div>
          <p className="text-2xl font-extrabold text-aces-purple-900">{participation}%</p>
          <p className="text-xs font-medium text-aces-purple-400">Participation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Election Status" className="lg:col-span-2">
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-aces-purple-400">Election Start</dt>
              <dd className="font-semibold text-aces-purple-900">
                {election?.startAt ? new Date(election.startAt).toLocaleString("en-IN") : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-aces-purple-400">Election End</dt>
              <dd className="font-semibold text-aces-purple-900">
                {election?.endAt ? new Date(election.endAt).toLocaleString("en-IN") : "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-5">
            <p className="mb-1.5 flex justify-between text-xs font-semibold text-aces-purple-500">
              <span>Participation</span>
              <span>{participation}%</span>
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-aces-purple-100">
              <div
                className="h-full rounded-full bg-aces-purple-600 transition-all"
                style={{ width: `${participation}%` }}
              />
            </div>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-2">
            {(election?.status === "SCHEDULED" || election?.status === "PAUSED") && (
              <Button type="button" variant="gold" className="w-full" onClick={handleStartElection} disabled={starting}>
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {election.status === "PAUSED" ? "Resume Election" : "Open Election"}
              </Button>
            )}
            {election?.status === "LIVE" && (
              <Button type="button" variant="outline" className="w-full" onClick={handleStopElection} disabled={stopping}>
                {stopping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />} Stop Temporarily
              </Button>
            )}
            {(election?.status === "SCHEDULED" || election?.status === "PAUSED") && (
              <div className="space-y-2 rounded-lg border border-aces-purple-100 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-aces-purple-700"><CalendarClock className="h-4 w-4" /> Reschedule Voting</p>
                <input type="datetime-local" value={schedule.startAt} onChange={(e) => setSchedule((s) => ({ ...s, startAt: e.target.value }))} className="w-full rounded-lg border border-aces-purple-200 px-2 py-1.5 text-xs" />
                <input type="datetime-local" value={schedule.endAt} onChange={(e) => setSchedule((s) => ({ ...s, endAt: e.target.value }))} className="w-full rounded-lg border border-aces-purple-200 px-2 py-1.5 text-xs" />
                <Button type="button" size="sm" className="w-full" onClick={handleReschedule} disabled={rescheduling || !schedule.startAt || !schedule.endAt}>
                  {rescheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />} Save Schedule
                </Button>
              </div>
            )}
            <Link
              to="/admin/candidates"
              className="flex items-center gap-3 rounded-lg border border-aces-purple-100 px-3 py-2.5 text-sm font-medium text-aces-purple-700 hover:bg-aces-purple-50"
            >
              <Users2 className="h-4 w-4" /> Manage Candidates
            </Link>
            <Link
              to="/admin/tokens"
              className="flex items-center gap-3 rounded-lg border border-aces-purple-100 px-3 py-2.5 text-sm font-medium text-aces-purple-700 hover:bg-aces-purple-50"
            >
              <Eye className="h-4 w-4" /> View Participation
            </Link>
            {election?.status === "LIVE" && (
              <Link
                to="/admin/end-election"
                className="flex items-center gap-3 rounded-lg border border-red-100 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Power className="h-4 w-4" /> End Election
              </Link>
            )}
            {election?.status === "ENDED" && (
              <p className="px-3 py-2 text-sm font-medium text-aces-purple-400">Election has ended.</p>
            )}
          </div>
        </Card>
      </div>

      <Card title="Recent Activities" action={<Activity className="h-4 w-4 text-white/70" />}>
        {recentActivity?.length ? (
          <ul className="divide-y divide-aces-purple-50">
            {recentActivity.slice(0, 8).map((log) => (
              <li key={log._id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-aces-purple-700">{log.description}</span>
                <span className="shrink-0 text-xs text-aces-purple-300">{timeAgo(log.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-aces-purple-300">No recent activity yet.</p>
        )}
      </Card>
    </div>
  );
}
