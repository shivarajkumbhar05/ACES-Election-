import { useEffect, useState } from "react";
import { ListOrdered, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import { createPosition, deletePosition, listAdminPositions, updatePosition } from "../../api/admin";

const EMPTY = { name: "", category: "TYCO", order: 1 };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-aces-purple-900">Manage Positions</h1>
        <p className="text-sm text-aces-purple-500">Configure the offices that appear on each ballot.</p>
      </div>
      {error && <Alert type="error">{error}</Alert>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card title="Ballot Positions" bodyClassName="p-0">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin" /></div> : positions.length === 0 ? <p className="p-8 text-center text-sm text-aces-purple-400">No positions configured.</p> : (
            <div className="divide-y divide-aces-purple-50">
              {positions.map((position) => <div key={position._id} className="flex items-center gap-3 px-5 py-3"><ListOrdered className="h-4 w-4 text-aces-purple-400" /><div className="min-w-0 flex-1"><p className="font-semibold text-aces-purple-900">{position.order}. {position.name}</p><p className="text-xs text-aces-purple-400">{position.category} · {position.active ? "Active" : "Removed"}</p></div><button onClick={() => { setEditing(position); setForm({ name: position.name, category: position.category, order: position.order }); }} aria-label={`Edit ${position.name}`} className="p-1.5 text-aces-purple-400 hover:text-aces-purple-700"><Pencil className="h-4 w-4" /></button><button onClick={() => remove(position._id)} aria-label={`Remove ${position.name}`} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>)}
            </div>
          )}
        </Card>
        <Card title={editing ? "Edit Position" : "Add Position"}>
          <form onSubmit={save} className="space-y-3">
            <label className="block"><span className="mb-1 block text-xs font-semibold text-aces-purple-600">Position name</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-aces-purple-200 px-3 py-2 text-sm" /></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-aces-purple-600">Category</span><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-aces-purple-200 px-3 py-2 text-sm"><option value="TYCO">TYCO</option><option value="SYCO">SYCO</option></select></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-aces-purple-600">Display order</span><input required type="number" min="1" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-full rounded-lg border border-aces-purple-200 px-3 py-2 text-sm" /></label>
            <div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editing ? "Update" : "Add Position"}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div>
          </form>
        </Card>
      </div>
    </div>
  );
}
