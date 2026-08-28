import { useEffect, useState } from "react";
import { 
  FileSpreadsheet, 
  FileText, 
  Trophy, 
  Loader2, 
  Megaphone, 
  Users,
  Award,
  BarChart3,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Crown,
  Shield
} from "lucide-react";
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-aces-purple-500">
        <Loader2 className="h-12 w-12 animate-spin text-aces-purple-400" />
        <p className="mt-4 text-sm font-medium text-aces-purple-500">Loading election results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Alert type="warning" className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-500/20 p-2">
              <span className="text-amber-600 text-lg">⚠️</span>
            </div>
            <div>
              <p className="font-semibold text-amber-800">Results Unavailable</p>
              <p className="text-sm text-amber-700">{error} — results only unlock once the admin ends the election.</p>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  const { election, summary, positions } = results;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-aces-purple-50 to-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-aces-gold-500" />
            <h1 className="font-display text-2xl font-bold text-aces-purple-900">Final Results Dashboard</h1>
          </div>
          <p className="mt-1 text-sm text-aces-purple-500">{election.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExport("excel")} 
            disabled={exporting === "excel"}
            className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
          >
            {exporting === "excel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Download Excel</span>
            <span className="sm:hidden">Excel</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport("pdf")} 
            disabled={exporting === "pdf"}
            className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            {exporting === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-aces-purple-50">
            <Users className="h-5 w-5 text-aces-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-aces-purple-900">{summary.votesCast}</p>
          <p className="text-xs font-medium text-aces-purple-400">
            Votes Cast of {summary.eligibleStudents}
          </p>
        </div>

        <div className="group rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{summary.validVotes}</p>
          <p className="text-xs font-medium text-aces-purple-400">Valid Votes</p>
        </div>

        <div className="group rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-2xl font-extrabold text-red-500">{summary.invalidVotes}</p>
          <p className="text-xs font-medium text-aces-purple-400">Invalid Votes</p>
        </div>

        <div className="group rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-aces-gold-400/20">
            <TrendingUp className="h-5 w-5 text-aces-gold-600" />
          </div>
          <p className="text-2xl font-extrabold text-aces-gold-600">{summary.participationPercent}%</p>
          <p className="text-xs font-medium text-aces-purple-400">Participation Rate</p>
        </div>
      </div>

      {/* Results by Position */}
      <Card className="border-0 shadow-xl shadow-aces-purple-200/30">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aces-gold-400 via-aces-gold-500 to-aces-gold-400" />
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-aces-gold-500" />
              <h3 className="text-lg font-bold text-aces-purple-900">Results by Position</h3>
            </div>
            <span className="rounded-full bg-aces-purple-100 px-3 py-1 text-xs font-medium text-aces-purple-600">
              {summary.participationPercent}% participation
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-aces-purple-100 text-xs font-bold uppercase tracking-wide text-aces-purple-400">
                  <th className="px-5 py-3">Position</th>
                  <th className="px-5 py-3">Winner</th>
                  <th className="px-5 py-3 text-center">Votes</th>
                  <th className="px-5 py-3 text-center">Percentage</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => {
                  const winner = p.candidates.find((c) => c.isWinner) || p.candidates[0];
                  return (
                    <tr key={p.positionId} className="border-b border-aces-purple-50 transition-all hover:bg-aces-purple-50/50 last:border-none">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-aces-purple-800">{p.positionName}</span>
                        <span className="ml-2 text-xs text-aces-purple-400">({p.category})</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {winner?.name ? (
                          <span className="flex items-center gap-2 font-semibold text-aces-purple-900">
                            <Crown className="h-4 w-4 text-aces-gold-500" />
                            {winner.name}
                          </span>
                        ) : (
                          <span className="text-aces-purple-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center font-medium text-aces-purple-600">
                        {winner?.votes ?? 0}
                      </td>
                      <td className="px-5 py-3.5 text-center font-medium text-aces-purple-600">
                        {winner?.percentage != null ? `${winner.percentage}%` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {p.tie ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Tie
                          </span>
                        ) : (
                          <Trophy className="ml-auto h-5 w-5 text-aces-gold-500" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid gap-6">
        {positions.map((p) => {
          const totalVotes = p.candidates.reduce((sum, c) => sum + c.votes, 0);
          return (
            <Card key={p.positionId} className="border-0 shadow-xl shadow-aces-purple-200/30">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aces-purple-400 via-aces-purple-600 to-aces-purple-800" />
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-aces-purple-500" />
                    <h4 className="font-bold text-aces-purple-900">{p.positionName}</h4>
                    <span className="text-xs text-aces-purple-400">— Full Breakdown</span>
                  </div>
                  <span className="text-xs text-aces-purple-400">
                    Total Votes: <span className="font-semibold">{totalVotes}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {p.candidates.map((c) => (
                    <div key={c.candidateId} className="group">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <span className="text-sm font-medium text-aces-purple-800 truncate">
                            {c.name}
                          </span>
                          <span className="text-xs text-aces-purple-400">({c.className})</span>
                          {c.isWinner && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-aces-gold-100 px-2 py-0.5 text-[10px] font-bold text-aces-gold-700">
                              <Crown className="h-3 w-3" /> Winner
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-aces-purple-100">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${
                                c.isWinner 
                                  ? "bg-gradient-to-r from-aces-gold-400 to-aces-gold-500" 
                                  : "bg-aces-purple-300"
                              }`}
                              style={{ width: `${c.percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-20 shrink-0 text-right text-xs font-semibold text-aces-purple-600">
                          {c.votes} ({c.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Publish Section */}
      {election.status === "ENDED" && (
        <Card className="border-0 shadow-xl shadow-aces-purple-200/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />
          <div className="p-6 md:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 sm:items-center">
                <div className="rounded-full bg-emerald-500/20 p-2">
                  <Megaphone className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-aces-purple-900">Results Ready for Publication</p>
                  <p className="text-sm text-aces-purple-500">
                    Results are final but not yet published to students.
                  </p>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={handlePublish} 
                disabled={publishing}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 hover:from-emerald-600 hover:to-emerald-700"
              >
                {publishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Megaphone className="h-4 w-4" />
                )}
                Publish Results to Students
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 rounded-xl bg-aces-purple-50/50 p-4 text-xs text-aces-purple-400">
        <Shield className="h-3.5 w-3.5" />
        <span>All results are securely stored and verified.</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">Data is final and cannot be modified.</span>
      </div>
    </div>
  );
}