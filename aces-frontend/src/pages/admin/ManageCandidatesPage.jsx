import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, User, ToggleLeft, ToggleRight } from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import {
  listAdminCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  setCandidateStatus,
} from "../../api/admin";
import { listPositions } from "../../api/positions";

const EMPTY_FORM = { name: "", enrollmentNo: "", className: "", positionId: "", symbol: null, photo: null };

export default function ManageCandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function refresh() {
    setLoading(true);
    try {
      const [cands, pos] = await Promise.all([listAdminCandidates(), listPositions()]);
      setCandidates(cands);
      setPositions(pos);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(candidate) {
    setEditing(candidate);
    setForm({
      name: candidate.name,
      enrollmentNo: candidate.enrollmentNo,
      className: candidate.className,
      positionId: candidate.positionId?._id || candidate.positionId,
      symbol: null,
      photo: null,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.enrollmentNo || !form.className || !form.positionId) {
      setFormError("Please fill in name, enrollment number, class, and position.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("enrollmentNo", form.enrollmentNo);
      fd.append("className", form.className);
      fd.append("positionId", form.positionId);
      if (form.symbol) fd.append("symbol", form.symbol);
      if (form.photo) fd.append("photo", form.photo);

      if (editing) {
        await updateCandidate(editing._id, fd);
      } else {
        await createCandidate(fd);
      }
      setModalOpen(false);
      await refresh();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this candidate? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteCandidate(id);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleStatus(candidate) {
    const next = candidate.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await setCandidateStatus(candidate._id, next);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-aces-purple-900">Manage Candidates</h1>
          <p className="text-sm text-aces-purple-500">Add, edit, and manage election candidates by position.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Candidate
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <Card bodyClassName="p-0">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-aces-purple-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading candidates…
          </div>
        ) : candidates.length === 0 ? (
          <p className="p-8 text-center text-sm italic text-aces-purple-300">
            No candidates yet. Add your first candidate to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-aces-purple-50 text-xs font-bold uppercase tracking-wide text-aces-purple-400">
                  <th className="px-5 py-3">Photo</th>
                  <th className="px-5 py-3">Symbol</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Position</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c._id} className="border-b border-aces-purple-50 last:border-none">
                    <td className="px-5 py-3">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-aces-purple-100 text-aces-purple-500">
                        {c.photoUrl ? (
                          <img src={c.photoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {c.symbolUrl ? <img src={c.symbolUrl} alt={`${c.name} symbol`} className="h-9 w-9 object-contain" /> : <span className="text-aces-purple-300">-</span>}
                    </td>
                    <td className="px-5 py-3 font-medium text-aces-purple-900">{c.name}</td>
                    <td className="px-5 py-3 text-aces-purple-600">
                      {c.positionId?.name} <span className="text-xs text-aces-purple-300">({c.positionId?.category})</span>
                    </td>
                    <td className="px-5 py-3 text-aces-purple-600">{c.className}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-aces-purple-100 text-aces-purple-500"
                        }`}
                      >
                        {c.status === "ACTIVE" ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                        {c.status}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-lg p-1.5 text-aces-purple-400 hover:bg-aces-purple-50 hover:text-aces-purple-700"
                          aria-label={`Edit ${c.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          disabled={deletingId === c._id}
                          className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${c.name}`}
                        >
                          {deletingId === c._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modalOpen && (
        <Modal
          title={editing ? "Edit Candidate" : "Add Candidate"}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Candidate"}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-aces-purple-600">Full Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-aces-purple-200 px-3 py-2 text-sm focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-aces-purple-600">Enrollment No.</span>
                <input
                  value={form.enrollmentNo}
                  onChange={(e) => setForm((f) => ({ ...f, enrollmentNo: e.target.value }))}
                  className="w-full rounded-lg border border-aces-purple-200 px-3 py-2 text-sm focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-aces-purple-600">Class</span>
                <input
                  value={form.className}
                  onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))}
                  placeholder="e.g. CE-3A"
                  className="w-full rounded-lg border border-aces-purple-200 px-3 py-2 text-sm focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-aces-purple-600">Position</span>
              <select
                value={form.positionId}
                onChange={(e) => setForm((f) => ({ ...f, positionId: e.target.value }))}
                className="w-full rounded-lg border border-aces-purple-200 px-3 py-2 text-sm focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
              >
                <option value="">Select a position</option>
                {positions.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-aces-purple-600">Symbol image (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.files?.[0] || null }))}
                className="w-full text-sm text-aces-purple-600 file:mr-3 file:rounded-lg file:border-0 file:bg-aces-purple-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-aces-purple-700"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-aces-purple-600">Photo (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((f) => ({ ...f, photo: e.target.files?.[0] || null }))}
                className="w-full text-sm text-aces-purple-600 file:mr-3 file:rounded-lg file:border-0 file:bg-aces-purple-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-aces-purple-700"
              />
            </label>
            {formError && <Alert type="error">{formError}</Alert>}
          </div>
        </Modal>
      )}
    </div>
  );
}
