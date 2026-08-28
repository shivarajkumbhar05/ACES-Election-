import { useEffect, useState } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  User, 
  ToggleLeft, 
  ToggleRight,
  Users,
  Award,
  GraduationCap,
  Image,
  Camera,
  Search,
  Filter,
  Sparkles
} from "lucide-react";
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

function CandidateCard({ candidate, onEdit, onDelete, onToggleStatus, deletingId }) {
  return (
    <div className="group rounded-xl border-2 border-aces-purple-100 bg-white p-4 transition-all duration-300 hover:shadow-xl hover:border-aces-purple-300 hover:scale-[1.02]">
      <div className="flex items-start gap-4">
        {/* Photo */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-aces-purple-100 to-aces-purple-200">
          {candidate.photoUrl ? (
            <img src={candidate.photoUrl} alt={candidate.name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-aces-purple-500" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-aces-purple-900 truncate">{candidate.name}</h4>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-aces-purple-500">
                  <GraduationCap className="h-3 w-3" />
                  {candidate.className}
                </span>
                <span className="text-aces-purple-300">•</span>
                <span className="text-aces-purple-500">{candidate.enrollmentNo}</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => onEdit(candidate)}
                className="rounded-lg p-1.5 text-aces-purple-400 transition-all hover:bg-aces-purple-50 hover:text-aces-purple-700 hover:scale-110"
                aria-label={`Edit ${candidate.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(candidate._id)}
                disabled={deletingId === candidate._id}
                className="rounded-lg p-1.5 text-red-400 transition-all hover:bg-red-50 hover:text-red-600 hover:scale-110"
                aria-label={`Delete ${candidate.name}`}
              >
                {deletingId === candidate._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Position */}
            <span className="inline-flex items-center gap-1 rounded-full bg-aces-purple-50 px-2.5 py-0.5 text-xs font-medium text-aces-purple-600">
              <Award className="h-3 w-3" />
              {candidate.positionId?.name}
              <span className="text-aces-purple-300">({candidate.positionId?.category})</span>
            </span>

            {/* Status toggle */}
            <button
              onClick={() => onToggleStatus(candidate)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all hover:scale-105 ${
                candidate.status === "ACTIVE"
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-aces-purple-100 text-aces-purple-500 hover:bg-aces-purple-200"
              }`}
            >
              {candidate.status === "ACTIVE" ? (
                <ToggleRight className="h-3.5 w-3.5" />
              ) : (
                <ToggleLeft className="h-3.5 w-3.5" />
              )}
              {candidate.status}
            </button>

            {/* Symbol preview */}
            {candidate.symbolUrl && (
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5">
                <Image className="h-3 w-3 text-amber-500" />
                <img src={candidate.symbolUrl} alt="Symbol" className="h-5 w-5 object-contain" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

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

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCandidates = candidates.length;
  const activeCandidates = candidates.filter(c => c.status === "ACTIVE").length;
  const inactiveCandidates = candidates.filter(c => c.status === "INACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-aces-purple-50 to-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-aces-purple-600" />
            <h1 className="font-display text-2xl font-bold text-aces-purple-900">Manage Candidates</h1>
          </div>
          <p className="mt-1 text-sm text-aces-purple-500">
            Add, edit, and manage election candidates by position.
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-gradient-to-r from-aces-purple-600 to-aces-purple-700 text-white shadow-lg shadow-aces-purple-200/50 hover:from-aces-purple-700 hover:to-aces-purple-800"
        >
          <Plus className="h-4 w-4" /> Add Candidate
        </Button>
      </div>

      {error && (
        <Alert type="error" className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="font-medium text-red-800">{error}</span>
          </div>
        </Alert>
      )}

      {/* Stats */}
      {!loading && candidates.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-white p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-aces-purple-900">{totalCandidates}</p>
            <p className="text-xs font-medium text-aces-purple-400">Total Candidates</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-emerald-600">{activeCandidates}</p>
            <p className="text-xs font-medium text-aces-purple-400">Active</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-aces-purple-400">{inactiveCandidates}</p>
            <p className="text-xs font-medium text-aces-purple-400">Inactive</p>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      {!loading && candidates.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aces-purple-400" />
            <input
              type="text"
              placeholder="Search candidates by name, enrollment, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-2 border-aces-purple-200 bg-white px-4 py-2.5 pl-10 text-sm text-aces-purple-900 placeholder:text-aces-purple-400 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-aces-purple-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border-2 border-aces-purple-200 bg-white px-4 py-2.5 text-sm text-aces-purple-900 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      )}

      {/* Candidates Grid */}
      <Card className="border-0 shadow-xl shadow-aces-purple-200/30">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aces-purple-400 via-aces-purple-600 to-aces-purple-800" />
        <div className="p-6 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-aces-purple-500">
              <Loader2 className="h-10 w-10 animate-spin text-aces-purple-400" />
              <p className="text-sm font-medium">Loading candidates…</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-aces-purple-100">
                <Users className="h-8 w-8 text-aces-purple-400" />
              </div>
              <p className="text-sm font-medium text-aces-purple-600">
                {candidates.length === 0 ? "No candidates yet." : "No candidates match your search."}
              </p>
              <p className="mt-1 text-xs text-aces-purple-400">
                {candidates.length === 0
                  ? "Add your first candidate to get started."
                  : "Try adjusting your search or filter."}
              </p>
              {candidates.length === 0 && (
                <Button
                  onClick={openAdd}
                  className="mt-4 bg-gradient-to-r from-aces-purple-600 to-aces-purple-700 text-white"
                >
                  <Plus className="h-4 w-4" /> Add First Candidate
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate._id}
                  candidate={candidate}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  deletingId={deletingId}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal */}
      {modalOpen && (
        <Modal
          title={
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-aces-gold-500" />
              <span>{editing ? "Edit Candidate" : "Add New Candidate"}</span>
            </div>
          }
          onClose={() => setModalOpen(false)}
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-aces-purple-600 to-aces-purple-700 text-white"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Candidate"}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                <User className="h-4 w-4" /> Full Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Enter candidate's full name"
                className="w-full rounded-xl border-2 border-aces-purple-200 px-4 py-2.5 text-sm text-aces-purple-900 placeholder:text-aces-purple-400 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Enrollment */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                  <GraduationCap className="h-4 w-4" /> Enrollment No.
                </label>
                <input
                  value={form.enrollmentNo}
                  onChange={(e) => setForm((f) => ({ ...f, enrollmentNo: e.target.value }))}
                  placeholder="e.g. CE2023001"
                  className="w-full rounded-xl border-2 border-aces-purple-200 px-4 py-2.5 text-sm text-aces-purple-900 placeholder:text-aces-purple-400 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                />
              </div>

              {/* Class */}
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                  <Users className="h-4 w-4" /> Class
                </label>
                <input
                  value={form.className}
                  onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))}
                  placeholder="e.g. CE-3A"
                  className="w-full rounded-xl border-2 border-aces-purple-200 px-4 py-2.5 text-sm text-aces-purple-900 placeholder:text-aces-purple-400 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
                />
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                <Award className="h-4 w-4" /> Position
              </label>
              <select
                value={form.positionId}
                onChange={(e) => setForm((f) => ({ ...f, positionId: e.target.value }))}
                className="w-full rounded-xl border-2 border-aces-purple-200 px-4 py-2.5 text-sm text-aces-purple-900 focus:border-aces-purple-500 focus:outline-none focus:ring-2 focus:ring-aces-purple-100"
              >
                <option value="">Select a position</option>
                {positions.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Symbol */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                <Image className="h-4 w-4" /> Symbol Image
                <span className="text-xs font-normal text-aces-purple-400">(optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.files?.[0] || null }))}
                  className="flex-1 text-sm text-aces-purple-600 file:mr-3 file:rounded-lg file:border-0 file:bg-aces-purple-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-aces-purple-700 hover:file:bg-aces-purple-200"
                />
                {form.symbol && (
                  <span className="text-xs text-emerald-600">✓ File selected</span>
                )}
              </div>
            </div>

            {/* Photo */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-aces-purple-700">
                <Camera className="h-4 w-4" /> Photo
                <span className="text-xs font-normal text-aces-purple-400">(optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((f) => ({ ...f, photo: e.target.files?.[0] || null }))}
                  className="flex-1 text-sm text-aces-purple-600 file:mr-3 file:rounded-lg file:border-0 file:bg-aces-purple-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-aces-purple-700 hover:file:bg-aces-purple-200"
                />
                {form.photo && (
                  <span className="text-xs text-emerald-600">✓ File selected</span>
                )}
              </div>
            </div>

            {formError && (
              <Alert type="error" className="border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span className="text-sm font-medium text-red-800">{formError}</span>
                </div>
              </Alert>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}