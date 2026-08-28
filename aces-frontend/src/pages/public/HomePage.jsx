import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Vote, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Building2, 
  Loader2,
  Sparkles,
  Shield,
  Award,
  Clock,
  TrendingUp,
  Users,
  BadgeCheck,
  Fingerprint,
  Gift,
  Crown,
  BarChart3,
  ChevronRight,
  Eye,
  UserCheck,
  Timer
} from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import PageTitle from "../../components/PageTitle";
import { getCurrentElection, getPublishedResults } from "../../api/election";

const INSTRUCTIONS = [
  "Each student can vote only once.",
  "Select one candidate for each position.",
  "Review your ballot before final submission.",
  "Once submitted, your vote cannot be changed.",
];

function StatusPill({ status }) {
  const map = {
    LIVE: {
      bg: "bg-gradient-to-r from-emerald-400 to-emerald-500",
      text: "text-white",
      border: "border-emerald-400",
      icon: <Sparkles className="h-3.5 w-3.5 animate-pulse" />,
      label: "● LIVE"
    },
    SCHEDULED: {
      bg: "bg-gradient-to-r from-amber-400 to-amber-500",
      text: "text-white",
      border: "border-amber-400",
      icon: <Timer className="h-3.5 w-3.5" />,
      label: "SCHEDULED"
    },
    ENDED: {
      bg: "bg-gradient-to-r from-rose-400 to-rose-500",
      text: "text-white",
      border: "border-rose-400",
      icon: <Clock className="h-3.5 w-3.5" />,
      label: "ENDED"
    },
    RESULTS_PUBLISHED: {
      bg: "bg-gradient-to-r from-aces-purple-500 to-aces-purple-600",
      text: "text-white",
      border: "border-aces-purple-500",
      icon: <Crown className="h-3.5 w-3.5" />,
      label: "RESULTS OUT"
    },
  };

  const config = map[status] || {
    bg: "bg-gradient-to-r from-gray-400 to-gray-500",
    text: "text-white",
    border: "border-gray-400",
    icon: null,
    label: status?.replaceAll("_", " ") || "UNKNOWN"
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-xs font-bold shadow-lg ${config.bg} ${config.text} ${config.border}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

function AnimatedCounter({ value, label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-aces-purple-900">{count}</p>
      <p className="text-xs font-medium text-aces-purple-500">{label}</p>
    </div>
  );
}

function FeatureBadge({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-aces-purple-500" />
      <span className="text-xs font-medium text-aces-purple-700">{text}</span>
    </div>
  );
}

export default function HomePage() {
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishedResults, setPublishedResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([getCurrentElection(), getPublishedResults()]).then(([electionResult, resultsResult]) => {
      if (electionResult.status === "fulfilled") setElection(electionResult.value);
      else if (electionResult.reason.message.includes("No election")) setError(electionResult.reason.message);
      if (resultsResult.status === "fulfilled") setPublishedResults(resultsResult.value);
    }).finally(() => setLoading(false));
  }, []);

  const isLive = election?.status === "LIVE";

  // Calculate total positions and candidates for stats
  const totalPositions = election?.positions?.length || 0;
  const totalCandidates = election?.positions?.reduce((acc, pos) => acc + pos.candidates?.length || 0, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f1fb] via-white to-[#f3f1fb]">
      <PageTitle 
        title="Elect Your Leaders. Shape Your Future." 
        subtitle="Cast your vote for the Computer Engineering Department's student council — secure, transparent, and open to every eligible student." 
      />

      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Card className="relative overflow-hidden border-0 shadow-2xl shadow-aces-purple-200/30 transition-all duration-300 hover:shadow-3xl">
          {/* Premium gradient border */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-aces-purple-400 via-aces-purple-600 to-aces-purple-800" />
          
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-aces-purple-500 blur-3xl" />
            <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-aces-purple-400 blur-3xl" />
          </div>

          <div className="relative p-6 md:p-8">
            {/* Header Section */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-aces-purple-700 to-aces-purple-900 text-white shadow-xl shadow-aces-purple-200/50">
                <Vote className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-2xl font-bold tracking-tight text-aces-purple-900">
                    ACES Election Portal
                  </h3>
                  {election && <StatusPill status={election.status} />}
                </div>

                {loading ? (
                  <div className="mt-6 flex items-center gap-4 rounded-xl bg-aces-purple-50/50 p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-aces-purple-500" />
                    <div>
                      <p className="font-medium text-aces-purple-700">Loading election details…</p>
                      <p className="text-sm text-aces-purple-400">Please wait while we fetch the latest information</p>
                    </div>
                  </div>
                ) : error ? (
                  <Alert type="warning" className="mt-6 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-amber-500/20 p-2">
                        <span className="text-amber-600 text-lg">⚠️</span>
                      </div>
                      <span className="font-medium text-amber-800">{error}</span>
                    </div>
                  </Alert>
                ) : election ? (
                  <>
                    {/* Election Details Grid */}
                    <dl className="mt-6 grid grid-cols-1 gap-3 rounded-2xl bg-aces-purple-50/60 p-4 shadow-inner sm:grid-cols-2">
                      <div className="group flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] sm:justify-start sm:gap-3">
                        <dt className="flex items-center gap-2 text-sm font-medium text-aces-purple-500">
                          <span className="rounded-full bg-aces-purple-100 p-1.5 group-hover:scale-110 transition-transform">
                            <Users className="h-3.5 w-3.5" />
                          </span>
                          Election Body
                        </dt>
                        <dd className="font-semibold text-aces-purple-900">ACES Student Body</dd>
                      </div>
                      <div className="group flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] sm:justify-start sm:gap-3">
                        <dt className="flex items-center gap-2 text-sm font-medium text-aces-purple-500">
                          <span className="rounded-full bg-aces-purple-100 p-1.5 group-hover:scale-110 transition-transform">
                            <Building2 className="h-3.5 w-3.5" />
                          </span>
                          Department
                        </dt>
                        <dd className="font-semibold text-aces-purple-900">{election.department}</dd>
                      </div>
                      <div className="group flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] sm:justify-start sm:gap-3">
                        <dt className="flex items-center gap-2 text-sm font-medium text-aces-purple-500">
                          <span className="rounded-full bg-aces-purple-100 p-1.5 group-hover:scale-110 transition-transform">
                            <Calendar className="h-3.5 w-3.5" />
                          </span>
                          Election Date
                        </dt>
                        <dd className="font-semibold text-aces-purple-900">
                          {new Date(election.startAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </dd>
                      </div>
                      <div className="group flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] sm:justify-start sm:gap-3">
                        <dt className="flex items-center gap-2 text-sm font-medium text-aces-purple-500">
                          <span className="rounded-full bg-aces-purple-100 p-1.5 group-hover:scale-110 transition-transform">
                            <BadgeCheck className="h-3.5 w-3.5" />
                          </span>
                          Status
                        </dt>
                        <dd><StatusPill status={election.status} /></dd>
                      </div>
                    </dl>

                    {/* Quick Stats */}
                    {totalPositions > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-aces-purple-50 to-white p-3 text-center shadow-sm">
                          <p className="text-2xl font-bold text-aces-purple-700">{totalPositions}</p>
                          <p className="text-xs font-medium text-aces-purple-400">Positions</p>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-aces-purple-50 to-white p-3 text-center shadow-sm">
                          <p className="text-2xl font-bold text-aces-purple-700">{totalCandidates}</p>
                          <p className="text-xs font-medium text-aces-purple-400">Candidates</p>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-aces-purple-50 to-white p-3 text-center shadow-sm">
                          <p className="text-2xl font-bold text-aces-purple-700">
                            {election.status === "LIVE" ? "🔴" : "⚪"}
                          </p>
                          <p className="text-xs font-medium text-aces-purple-400">
                            {election.status === "LIVE" ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            {/* Instructions Section */}
            <div className="mt-8 rounded-2xl bg-gradient-to-br from-aces-purple-50 via-aces-purple-50/80 to-white p-6 shadow-inner">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-aces-purple-200" />
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-aces-purple-600">
                  <Shield className="h-4 w-4" /> Voting Guidelines
                </p>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-aces-purple-200" />
              </div>
              <ul className="space-y-3">
                {INSTRUCTIONS.map((line) => (
                  <li key={line} className="group flex items-start gap-3 rounded-xl bg-white/80 p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-white">
                    <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1.5 group-hover:bg-emerald-500/20 transition-all">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 transition-transform group-hover:scale-110" />
                    </div>
                    <span className="text-sm font-medium text-aces-purple-800">{line}</span>
                  </li>
                ))}
              </ul>

              {/* Feature Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                <FeatureBadge icon={Fingerprint} text="Secure Voting" />
                <FeatureBadge icon={Eye} text="Transparent" />
                <FeatureBadge icon={UserCheck} text="Verified" />
                <FeatureBadge icon={Gift} text="One Vote Per Student" />
              </div>
            </div>

            {/* Status Message */}
            {!loading && !isLive && !error && (
              <Alert type="info" className="mt-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-500/20 p-2.5">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">Voting Session Inactive</p>
                    <p className="text-sm text-blue-700">
                      Come back once the election status shows <strong className="text-blue-900">LIVE</strong> to cast your vote.
                    </p>
                  </div>
                </div>
              </Alert>
            )}

            {/* Action Button */}
            <Button
              size="lg"
              className={`mt-8 w-full sm:w-auto ${
                isLive 
                  ? "bg-gradient-to-r from-aces-purple-600 via-aces-purple-700 to-aces-purple-800 hover:from-aces-purple-700 hover:via-aces-purple-800 hover:to-aces-purple-900 shadow-xl shadow-aces-purple-200/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]" 
                  : "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-60"
              } font-semibold px-8 py-4 text-lg group relative overflow-hidden`}
              disabled={!isLive}
              onClick={() => navigate("/vote")}
            >
              {isLive && (
                <span className="absolute inset-0 overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </span>
              )}
              <span className="flex items-center justify-center gap-3 relative z-10">
                <Vote className={`h-5 w-5 ${isLive ? "group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" : ""}`} />
                <span>{isLive ? "Start Voting Now" : "Voting Not Available"}</span>
                <ArrowRight className={`h-5 w-5 ${isLive ? "group-hover:translate-x-1 transition-transform" : ""}`} />
              </span>
            </Button>

            {/* Footer */}
            <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t-2 border-aces-purple-100/50 pt-6 text-xs text-aces-purple-400 sm:flex-row">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <span className="flex items-center gap-2">
                  <span className="rounded-full bg-aces-purple-600/20 p-1">
                    <span className="block h-1.5 w-1.5 rounded-full bg-aces-purple-600" />
                  </span>
                  <span className="font-medium">HOD: Gaikawad S.T.</span>
                </span>
                <span className="hidden sm:inline text-aces-purple-300">|</span>
                <span className="flex items-center gap-2">
                  <span className="rounded-full bg-aces-purple-600/20 p-1">
                    <span className="block h-1.5 w-1.5 rounded-full bg-aces-purple-600" />
                  </span>
                  <span className="font-medium">ACES Coordinator: Nigadale G.A.</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-aces-purple-300">
                <Shield className="h-3.5 w-3.5" />
                <span className="font-medium">Secure • Transparent • Verified</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Results Section */}
      {publishedResults && (
        <section className="mx-auto max-w-4xl px-4 pb-16">
          <Card className="relative overflow-hidden border-0 shadow-2xl shadow-aces-purple-200/30 transition-all duration-300 hover:shadow-3xl">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
            
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 right-10 h-40 w-40 rounded-full bg-amber-500 blur-3xl" />
              <div className="absolute bottom-10 left-10 h-32 w-32 rounded-full bg-amber-400 blur-3xl" />
            </div>

            <div className="relative p-6 md:p-8">
              <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
                <h3 className="flex items-center gap-3 text-xl font-bold text-aces-purple-900">
                  <div className="rounded-full bg-gradient-to-br from-amber-400 to-amber-500 p-2.5 text-white shadow-lg">
                    <Award className="h-5 w-5" />
                  </div>
                  <span>Election Results</span>
                </h3>
                <span className="rounded-full bg-gradient-to-r from-aces-purple-100 to-aces-purple-200 px-4 py-1.5 text-xs font-bold text-aces-purple-700 shadow-sm">
                  🏛️ Official Declaration
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {publishedResults.positions.map((position) => {
                  const winner = position.candidates.find((candidate) => candidate.isWinner);
                  const totalVotes = position.candidates.reduce((sum, c) => sum + c.votes, 0);
                  
                  return (
                    <div 
                      key={position.positionId} 
                      className="group relative overflow-hidden rounded-xl border-2 border-aces-purple-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-aces-purple-300"
                    >
                      {winner && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-gradient-to-br from-amber-400 to-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg rounded-bl-xl">
                            WINNER
                          </div>
                        </div>
                      )}
                      
                      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-aces-purple-500">
                        <span className="rounded-full bg-aces-purple-100 p-1">
                          <BarChart3 className="h-3 w-3" />
                        </span>
                        {position.positionName}
                      </p>
                      
                      {winner ? (
                        <div className="mt-3">
                          <p className="flex items-center gap-2 text-lg font-bold text-aces-purple-900">
                            <span className="text-2xl">🏆</span>
                            {winner.name}
                          </p>
                          <div className="mt-2 flex items-center gap-3 text-sm">
                            <span className="font-semibold text-aces-purple-600">{winner.votes} votes</span>
                            <span className="text-aces-purple-300">•</span>
                            <span className="font-medium text-aces-purple-400">
                              {totalVotes > 0 ? Math.round((winner.votes / totalVotes) * 100) : 0}% of votes
                            </span>
                          </div>
                          <div className="mt-3 h-2 w-full rounded-full bg-aces-purple-100 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 transition-all duration-1000 group-hover:opacity-80"
                              style={{ width: `${totalVotes > 0 ? (winner.votes / totalVotes) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 font-medium text-aces-purple-600">Tie / no winner</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Results Summary */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t-2 border-aces-purple-100/50 pt-6">
                <div className="flex items-center gap-2 text-sm text-aces-purple-500">
                  <Users className="h-4 w-4" />
                  <span>Total Votes Cast: <strong className="text-aces-purple-700">
                    {publishedResults.positions.reduce((acc, pos) => 
                      acc + pos.candidates.reduce((sum, c) => sum + c.votes, 0), 0
                    )}
                  </strong></span>
                </div>
                <div className="h-4 w-px bg-aces-purple-200" />
                <div className="flex items-center gap-2 text-sm text-aces-purple-500">
                  <Crown className="h-4 w-4" />
                  <span>Positions: <strong className="text-aces-purple-700">{publishedResults.positions.length}</strong></span>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}