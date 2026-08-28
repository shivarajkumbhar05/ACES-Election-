import { useEffect, useState } from "react";
import { 
  ListOrdered, 
  Loader2, 
  Pencil, 
  Plus, 
  Trash2,
  Award,
  Tag,
  Hash,
  Sparkles,
  Shield,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import { createPosition, deletePosition, listAdminPositions, updatePosition } from "../../api/admin";

const EMPTY = { name: "", category: "TYCO", order: 1 };

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="h-3 w-3" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-aces-purple-100 px-2.5 py-0.5 text-xs font-medium text-aces-purple-500">
      <XCircle className="h-3 w-3" /> Removed
    </span>
  );
}

function PositionCard({ position, onEdit, onDelete }) {
  return (
    <div className="group rounded-xl border-2 border-aces-purple-100 bg-white p-4 transition-all duration-300 hover:shadow-xl hover:border-aces-purple-300 hover:scale-[1.02]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aces-purple-100 to-aces-purple-200 text-aces-purple-600">
          <span className="text-sm font-bold">{position.order}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-aces-purple-900">{position.name}</h4>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-aces-purple-50 px-2.5 py-0.5 text-xs font-medium text-aces-purple-600">
                  <Tag className="h-3 w-3" />
                  {position.category}
                </span>
                <StatusBadge active={position.active} />
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => onEdit(position)}
                className="rounded-lg p-1.5 text-aces-purple-400 transition-all hover:bg-aces-purple-50 hover:text-aces-purple-700 hover:scale-110"
                aria-label={`Edit ${position.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(position._id)}
                className="rounded-lg p-1.5 text-red-400 transition-all hover:bg-red-50 hover:text-red-600 hover:scale-110"
                aria-label={`Remove ${position.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagePositionsPage() {
  const [positions, setPositions] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setPositions(await listAdminPositions());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function reset() {
    setEditing(null);
    setForm({ ...EMPTY, order: positions.length + 1 });
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) await updatePosition(editing._id, form);
      else await createPosition(form);
      reset();
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Remove this position from future ballots?")) return;
    try {
      await deletePosition(id);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  const totalPositions = positions.length;
  const activePositions = positions.filter(p => p.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-aces-purple-50 to-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-aces-purple-600" />
            <h1 className="font-display text-2xl font-bold text-aces-purple-900">Manage Positions</h1>
          </div>
          <p className="mt-1 text-sm text-aces-purple-500">
            Configure the offices that appear on each ballot.
          </p>
        </div>
        {!loading && positions.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-aces-purple-400">
              <span className="font-bold text-aces-purple-900">{totalPositions}</span> total
            </span>
            <span className="h-4 w-px bg-aces-purple-200" />
            <span className="text-xs text-emerald-600">
              <span className="font-bold">{activePositions}</span> active
            </span>
          </div>
        )}
      </div>

      {error && (
        <Alert type="error" className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="font-medium text-red-800">{error}</span>
          </div>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Positions List */}
        <Card className="border-0 shadow-xl shadow-aces-purple-200/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aces-purple-400 via-aces-purple-600 to-aces-purple-800" />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <ListOrdered className="h-4 w-4 text-aces-purple-500" />
              <h3 className="text-lg font-bold text-aces-purple-900">Ballot Positions</h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-aces-purple-500">
                <Loader2 className="h-10 w-10 animate-spin text-aces-purple-400" />
                <p className="text-sm font-medium">Loading positions…</p>
              </div>
            ) : positions.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-aces-purple-100">
                  <Award className="h-8 w-8 text-aces-purple-400" />
                </div>
                <p className="text-sm font-medium text-aces-purple-600">No positions configured.</p>
                <p className="mt-1 text-xs text-aces-purple-400">
                  Add your first position using the form on the right.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {positions.map((position) => (
                  <PositionCard
                    key={position._id}
                    position={position}
                    onEdit={(p) => {
                      setEditing(p);
                      setForm({ name: p.name, category: p.category, order: p.order });
                    }}
                    onDelete={remove}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Add/Edit Form */}
        <Card className="border-0 shadow-xl shadow-aces-purple-200/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aces-gold-400 via-aces-gold-500 to-aces-gold-400" />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-4 w-4 text-aces-gold-500" />
              <h3 className="text-lg font-bold text-aces-purple-900">
                {editing ? "Edit Position" : "Add New Position"}
              </h3>
            </div>

            <form onSubmit={save} className="space-y-4">
              {/* Position Name */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                  <Award className="h-4 w-4" /> Position Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Class Representative"
                  className="w-full rounded-xl border-2 border-aces-purple-200 px-4 py-2.5 text-sm text-aces-purple-900 placeholder:text-aces-purple-400 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                  <Tag className="h-4 w-4" /> Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border-2 border-aces-purple-200 px-4 py-2.5 text-sm text-aces-purple-900 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                >
                  <option value="TYCO">TYCO</option>
                  <option value="SYCO">SYCO</option>
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                  <Hash className="h-4 w-4" /> Display Order
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="w-full rounded-xl border-2 border-aces-purple-200 px-4 py-2.5 text-sm text-aces-purple-900 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                />
                <p className="mt-1 text-xs text-aces-purple-400">
                  Positions will appear in ascending order on the ballot.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-aces-purple-600 to-aces-purple-700 text-white shadow-lg shadow-aces-purple-200/50 hover:from-aces-purple-700 hover:to-aces-purple-800"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editing ? (
                    <Pencil className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {editing ? "Update Position" : "Add Position"}
                </Button>
                {editing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={reset}
                    className="border-2 border-aces-purple-200 text-aces-purple-600 hover:bg-aces-purple-50"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="flex items-center justify-center gap-2 rounded-xl bg-aces-purple-50/50 p-4 text-xs text-aces-purple-400">
        <Shield className="h-3.5 w-3.5" />
        <span>Positions can be managed at any time. Changes will reflect on the next election.</span>
      </div>
    </div>
  );
}