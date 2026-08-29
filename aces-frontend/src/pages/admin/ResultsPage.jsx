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
  Shield,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Printer,
  Share2,
  RefreshCw
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
  const [expandedPositions, setExpandedPositions] = useState(new Set());
  const [showAllCandidates, setShowAllCandidates] = useState({});

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

  const togglePosition = (positionId) => {
    setExpandedPositions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(positionId)) {
        newSet.delete(positionId);
      } else {
        newSet.add(positionId);
      }
      return newSet;
    });
  };

  const toggleAllCandidates = (positionId) => {
    setShowAllCandidates(prev => ({
      ...prev,
      [positionId]: !prev[positionId]
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-aces-purple-400/20" />
          <Loader2 className="relative h-12 w-12 animate-spin text-aces-purple-500" />
        </div>
        <p className="mt-6 text-sm font-medium text-aces-purple-500 animate-pulse">
          Loading election results...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Alert type="warning" className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-500/20 p-2.5 flex-shrink-0">
              <span className="text-amber-600 text-xl">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800 text-lg">Results Unavailable</p>
              <p className="text-sm text-amber-700 mt-1">{error}</p>
              <p className="text-sm text-amber-600 mt-2 bg-amber-100/50 p-2 rounded-lg">
                💡 Results are only accessible once the admin ends the election.
              </p>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  const { election, summary, positions } = results;

  // Calculate additional stats
  const totalVotes = summary?.votesCast || 0;
  const completionRate = summary?.eligibleStudents 
    ? Math.round((totalVotes / summary.eligibleStudents) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      {/* Header with gradient and animation */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-aces-purple-900 via-aces-purple-800 to-aces-purple-700 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-2.5 backdrop-blur-sm">
                <Trophy className="h-6 w-6 text-aces-gold-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-white tracking-tight">
                  Final Results Dashboard
                </h1>
                <p className="text-aces-purple-200/80 text-sm flex items-center gap-2">
                  <span>{election.name}</span>
                  <span className="w-1 h-1 rounded-full bg-aces-purple-300/50" />
                  <span>{new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={refresh}
              className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport("excel")} 
              disabled={exporting === "excel"}
              className="border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all duration-300 backdrop-blur-sm"
            >
              {exporting === "excel" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport("pdf")} 
              disabled={exporting === "pdf"}
              className="border-rose-400/30 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/50 transition-all duration-300 backdrop-blur-sm"
            >
              {exporting === "pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards with improved animations */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Users,
            label: "Votes Cast",
            value: summary.votesCast,
            subtext: `of ${summary.eligibleStudents} eligible`,
            color: "purple",
            gradient: "from-aces-purple-50 to-aces-purple-100/30"
          },
          {
            icon: CheckCircle2,
            label: "Valid Votes",
            value: summary.validVotes,
            subtext: `${completionRate}% turnout rate`,
            color: "emerald",
            gradient: "from-emerald-50 to-emerald-100/30"
          },
          {
            icon: XCircle,
            label: "Invalid Votes",
            value: summary.invalidVotes,
            subtext: `${summary.invalidVotes > 0 ? '⚠️' : '✓'} ${summary.invalidVotes > 0 ? 'Review needed' : 'All valid'}`,
            color: "red",
            gradient: "from-red-50 to-red-100/30"
          },
          {
            icon: TrendingUp,
            label: "Participation",
            value: `${summary.participationPercent}%`,
            subtext: `${completionRate}% completion rate`,
            color: "gold",
            gradient: "from-aces-gold-50 to-aces-gold-100/30"
          }
        ].map((stat, index) => (
          <div 
            key={index}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative">
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-${stat.color}-50 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
              <p className="text-2xl font-extrabold text-aces-purple-900">
                {stat.value}
              </p>
              <p className="text-xs font-medium text-aces-purple-400 mt-0.5">
                {stat.label}
              </p>
              <p className="text-xs text-aces-purple-300 mt-1">
                {stat.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Results by Position - Enhanced Table */}
      <Card className="border-0 shadow-2xl shadow-aces-purple-200/40 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-aces-gold-400 via-aces-gold-500 to-aces-gold-400 animate-shimmer bg-[length:200%_100%]" />
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-aces-gold-50 p-2.5">
                <Award className="h-5 w-5 text-aces-gold-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-aces-purple-900">Results by Position</h3>
                <p className="text-xs text-aces-purple-400">
                  {positions.length} positions • {summary.participationPercent}% participation
                </p>
              </div>
            </div>
            <span className="rounded-full bg-aces-purple-100 px-4 py-1.5 text-xs font-semibold text-aces-purple-600">
              🏆 {summary.participationPercent}% 
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-aces-purple-100/50">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-aces-purple-50 to-aces-purple-100/30 text-xs font-bold uppercase tracking-wide text-aces-purple-500">
                  <th className="px-5 py-4">Position</th>
                  <th className="px-5 py-4">Winner</th>
                  <th className="px-5 py-4 text-center">Votes</th>
                  <th className="px-5 py-4 text-center">Percentage</th>
                  <th className="px-5 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p, index) => {
                  const winner = p.candidates.find((c) => c.isWinner) || p.candidates[0];
                  return (
                    <tr 
                      key={p.positionId} 
                      className={`border-b border-aces-purple-50 transition-all hover:bg-aces-purple-50/30 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-aces-purple-50/20'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span className="font-semibold text-aces-purple-800">{p.positionName}</span>
                        <span className="ml-2 text-xs text-aces-purple-400 bg-aces-purple-50 px-2 py-0.5 rounded-full">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {winner?.name ? (
                          <span className="flex items-center gap-2 font-semibold text-aces-purple-900">
                            <div className="rounded-full bg-aces-gold-100 p-1">
                              <Crown className="h-4 w-4 text-aces-gold-500" />
                            </div>
                            {winner.name}
                          </span>
                        ) : (
                          <span className="text-aces-purple-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-aces-purple-600">
                        {winner?.votes ?? 0}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {winner?.percentage != null ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="font-semibold text-aces-purple-600">{winner.percentage}%</span>
                            <div className="w-12 h-1.5 bg-aces-purple-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-aces-gold-400 to-aces-gold-500 rounded-full transition-all duration-1000"
                                style={{ width: `${winner.percentage}%` }}
                              />
                            </div>
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {p.tie ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            Tie
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-aces-gold-500">
                            <Trophy className="h-5 w-5" />
                            <span className="text-xs font-semibold">Winner</span>
                          </span>
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

      {/* Detailed Breakdown with Expand/Collapse */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-aces-purple-500" />
            <h3 className="text-lg font-bold text-aces-purple-900">Detailed Breakdown</h3>
          </div>
          <span className="text-xs text-aces-purple-400">
            Click to expand each position
          </span>
        </div>

        {positions.map((p) => {
          const totalVotes = p.candidates.reduce((sum, c) => sum + c.votes, 0);
          const isExpanded = expandedPositions.has(p.positionId);
          const showAll = showAllCandidates[p.positionId];
          const displayCandidates = showAll ? p.candidates : p.candidates.slice(0, 3);
          const hasMore = p.candidates.length > 3;

          return (
            <Card 
              key={p.positionId} 
              className={`border-0 shadow-lg shadow-aces-purple-200/30 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-aces-purple-200/40 ${
                isExpanded ? 'scale-[1.01]' : ''
              }`}
              onClick={() => togglePosition(p.positionId)}
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 ${
                isExpanded 
                  ? 'bg-gradient-to-r from-aces-purple-500 via-aces-purple-600 to-aces-purple-700' 
                  : 'bg-gradient-to-r from-aces-purple-300 to-aces-purple-400'
              }`} />
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 transition-all duration-300 ${
                      isExpanded ? 'bg-aces-purple-100' : 'bg-aces-purple-50'
                    }`}>
                      <BarChart3 className={`h-4 w-4 transition-all duration-300 ${
                        isExpanded ? 'text-aces-purple-700' : 'text-aces-purple-500'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-aces-purple-900">{p.positionName}</h4>
                      <p className="text-xs text-aces-purple-400">
                        {p.candidates.length} candidates • {totalVotes} total votes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-aces-purple-400">
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-aces-purple-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-aces-purple-400" />
                    )}
                  </div>
                </div>

                <div className={`space-y-4 transition-all duration-300 overflow-hidden ${
                  isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  {displayCandidates.map((c, index) => (
                    <div 
                      key={c.candidateId} 
                      className="group hover:bg-aces-purple-50/50 rounded-xl p-3 transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4 mb-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-aces-purple-800 truncate">
                              {c.name}
                            </span>
                            <span className="text-xs text-aces-purple-400 bg-aces-purple-50 px-2 py-0.5 rounded-full">
                              {c.className}
                            </span>
                            {c.isWinner && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-aces-gold-100 px-2.5 py-0.5 text-[10px] font-bold text-aces-gold-700 animate-pulse">
                                <Crown className="h-3 w-3" /> Winner
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 text-right text-sm font-bold text-aces-purple-600">
                          {c.votes} ({c.percentage}%)
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-aces-purple-100">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            c.isWinner 
                              ? "bg-gradient-to-r from-aces-gold-400 to-aces-gold-500 shadow-lg shadow-aces-gold-200/50" 
                              : "bg-gradient-to-r from-aces-purple-300 to-aces-purple-400"
                          }`}
                          style={{ 
                            width: `${c.percentage}%`,
                            transitionDelay: `${index * 50}ms`
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {hasMore && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAllCandidates(p.positionId);
                      }}
                      className="text-xs font-medium text-aces-purple-500 hover:text-aces-purple-700 transition-colors flex items-center gap-1 mt-2"
                    >
                      {showAll ? (
                        <>Show less <ChevronUp className="h-3 w-3" /></>
                      ) : (
                        <>Show all {p.candidates.length - 3} more <ChevronDown className="h-3 w-3" /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Publish Section with enhanced design */}
      {election.status === "ENDED" && (
        <Card className="relative border-0 shadow-2xl shadow-emerald-200/40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50" />
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 animate-shimmer bg-[length:200%_100%]" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4 sm:items-center">
                <div className="rounded-2xl bg-emerald-500/10 p-3.5 shadow-lg shadow-emerald-500/10">
                  <Megaphone className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-aces-purple-900 text-lg">
                    Results Ready for Publication
                  </p>
                  <p className="text-sm text-aces-purple-500 flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    {summary.votesCast} votes cast • Ready to share with students
                  </p>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={handlePublish} 
                disabled={publishing}
                className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-200/50 hover:shadow-2xl hover:shadow-emerald-200/70 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 px-8"
              >
                <span className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {publishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Megaphone className="h-4 w-4" />
                    Publish Results
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Footer */}
      <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-aces-purple-50/80 to-white p-5 border border-aces-purple-100/50">
        <div className="flex items-center gap-2 text-xs text-aces-purple-400">
          <Shield className="h-4 w-4 text-aces-purple-500" />
          <span>All results are securely stored and verified</span>
        </div>
        <span className="hidden sm:inline w-px h-4 bg-aces-purple-200" />
        <div className="flex items-center gap-2 text-xs text-aces-purple-400">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Data is final and cannot be modified</span>
        </div>
        <span className="hidden sm:inline w-px h-4 bg-aces-purple-200" />
        <div className="flex items-center gap-2 text-xs text-aces-purple-400">
          <Users className="h-4 w-4 text-aces-purple-500" />
          <span>{summary.eligibleStudents} eligible voters</span>
        </div>
      </div>
    </div>
  );
}