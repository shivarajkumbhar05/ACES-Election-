import { useEffect, useState } from "react";
import { FileSpreadsheet, FileText, Trophy, Loader2, Megaphone, Users } from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import { getResults, downloadExport, publishResults } from "../../api/admin";

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");
  const [publishing, setPublishing] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await getResults();
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleExport(kind) {
    setExporting(kind);
    try {
      await downloadExport(kind, results?.election?.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting("");
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      await publishResults(results?.election?.id);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-aces-purple-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading results…
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="warning">
        {error} — results only unlock once the admin ends the election.
      </Alert>
    );
  }

  const { election, summary, positions } = results;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-aces-purple-900">Final Results Dashboard</h1>
          <p className="text-sm text-aces-purple-500">{election.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("excel")} disabled={exporting === "excel"}>
            {exporting === "excel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            Download Excel
          </Button>
          <Button variant="danger" onClick={() => handleExport("pdf")} disabled={exporting === "pdf"}>
            {exporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 text-center shadow-card">
          <p className="text-2xl font-extrabold text-aces-purple-900">{summary.votesCast}</p>
          <p className="text-xs font-medium text-aces-purple-400">Total Votes Cast (of {summary.eligibleStudents})</p>
        </div>
        <div className="rounded-2xl bg-white p-5 text-center shadow-card">
          <p className="text-2xl font-extrabold text-emerald-600">{summary.validVotes}</p>
          <p className="text-xs font-medium text-aces-purple-400">Valid Votes</p>
        </div>
        <div className="rounded-2xl bg-white p-5 text-center shadow-card">
          <p className="text-2xl font-extrabold text-red-500">{summary.invalidVotes}</p>
          <p className="text-xs font-medium text-aces-purple-400">Invalid Votes</p>
        </div>
      </div>

      <Card
        title="Results by Position"
        bodyClassName="p-0"
        action={<span className="text-xs text-white/70">{summary.participationPercent}% participation</span>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-aces-purple-50 text-xs font-bold uppercase tracking-wide text-aces-purple-400">
                <th className="px-5 py-3">Position</th>
                <th className="px-5 py-3">Winner</th>
                <th className="px-5 py-3">Votes</th>
                <th className="px-5 py-3">Percentage</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const winner = p.candidates.find((c) => c.isWinner) || p.candidates[0];
                return (
                  <tr key={p.positionId} className="border-b border-aces-purple-50 last:border-none">
                    <td className="px-5 py-3 font-medium text-aces-purple-800">
                      {p.positionName} <span className="text-xs text-aces-purple-300">({p.category})</span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-aces-purple-900">{winner?.name || "—"}</td>
                    <td className="px-5 py-3 text-aces-purple-600">{winner?.votes ?? 0}</td>
                    <td className="px-5 py-3 text-aces-purple-600">
                      {winner?.percentage != null ? `${winner.percentage}%` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {p.tie ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">Tie</span>
                      ) : (
                        <Trophy className="ml-auto h-4 w-4 text-aces-gold-500" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {positions.map((p) => (
        <Card key={p.positionId} title={`${p.positionName} — full breakdown`}>
          <ul className="space-y-2">
            {p.candidates.map((c) => (
              <li key={c.candidateId} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-sm font-medium text-aces-purple-800">
                  {c.name} <span className="text-xs text-aces-purple-300">({c.className})</span>
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-aces-purple-100">
                  <div
                    className={`h-full rounded-full ${c.isWinner ? "bg-aces-gold-500" : "bg-aces-purple-300"}`}
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs font-semibold text-aces-purple-600">
                  {c.votes} ({c.percentage}%)
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      {election.status === "ENDED" && (
        <Alert type="info">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Results are final but not yet published to students.
            </span>
            <Button size="sm" onClick={handlePublish} disabled={publishing}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
              Publish Results
            </Button>
          </div>
        </Alert>
      )}
    </div>
  );
}
