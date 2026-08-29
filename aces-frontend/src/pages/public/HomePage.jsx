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
  Users,
  BadgeCheck,
  Fingerprint,
  Gift,
  Crown,
  BarChart3,
  Eye,
  UserCheck,
  Timer,
  HelpCircle,
  ArrowUp
} from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import PageTitle from "../../components/PageTitle";
import { getCurrentElection, getPublishedResults } from "../../api/election";
import { useVoting } from "../../context/VotingContext";

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

function FeatureBadge({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
      <Icon className="h-3.5 w-3.5 text-aces-purple-500" />
      <span className="text-xs font-medium text-aces-purple-700">{text}</span>
    </div>
  );
}

// NEW: Skeleton Loader Component
function ElectionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="h-20 w-20 shrink-0 rounded-2xl bg-aces-purple-200" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="h-8 w-48 rounded bg-aces-purple-200" />
            <div className="h-8 w-28 rounded-full bg-aces-purple-200" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-aces-purple-100" />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-aces-purple-100" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 rounded-2xl bg-aces-purple-50/60 p-6">
        <div className="h-6 w-40 rounded bg-aces-purple-200 mx-auto" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white/60" />
          ))}
        </div>
      </div>
    </div>
  );
}

// NEW: How to Vote Guide Modal
function VotingGuide({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 hover:bg-aces-purple-50 transition-colors"
        >
          <span className="sr-only">Close</span>
          <span className="text-2xl">✕</span>
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-full bg-gradient-to-br from-aces-purple-500 to-aces-purple-700 p-2.5 text-white shadow-lg">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-aces-purple-900">How Voting Works</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-aces-purple-50 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aces-purple-600 text-sm font-bold text-white">1</span>
            <div>
              <p className="font-semibold text-aces-purple-800">Check Eligibility</p>
              <p className="text-sm text-aces-purple-600">Only registered students of the Computer Engineering department can vote.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-aces-purple-50 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aces-purple-600 text-sm font-bold text-white">2</span>
            <div>
              <p className="font-semibold text-aces-purple-800">Select Your Candidates</p>
              <p className="text-sm text-aces-purple-600">Choose one candidate for each position. You can review your choices before submitting.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-aces-purple-50 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aces-purple-600 text-sm font-bold text-white">3</span>
            <div>
              <p className="font-semibold text-aces-purple-800">Review & Confirm</p>
              <p className="text-sm text-aces-purple-600">Double-check your ballot. Once submitted, your vote cannot be changed.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-aces-purple-50 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aces-purple-600 text-sm font-bold text-white">4</span>
            <div>
              <p className="font-semibold text-aces-purple-800">Submit</p>
              <p className="text-sm text-aces-purple-600">Cast your vote securely. Results will be published after the election ends.</p>
            </div>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="mt-6 w-full bg-gradient-to-r from-aces-purple-600 to-aces-purple-700 hover:from-aces-purple-700 hover:to-aces-purple-800"
        >
          Got it!
        </Button>
      </div>
    </div>
  );
}

// NEW: Back to Top Button
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 600) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-40 rounded-full bg-gradient-to-r from-aces-purple-600 to-aces-purple-700 p-3 text-white shadow-xl hover:from-aces-purple-700 hover:to-aces-purple-800 transition-all duration-300 hover:scale-110 hover:shadow-2xl"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

export default function HomePage() {
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishedResults, setPublishedResults] = useState(null);
  const [votingLoading, setVotingLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { startSession, loadBallot } = useVoting();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([getCurrentElection(), getPublishedResults()]).then(([electionResult, resultsResult]) => {
      if (electionResult.status === "fulfilled") setElection(electionResult.value);
      else if (electionResult.reason.message.includes("No election")) setError(electionResult.reason.message);
      if (resultsResult.status === "fulfilled") setPublishedResults(resultsResult.value);
    }).finally(() => setLoading(false));
  }, []);

  const isLive = election?.status === "LIVE";
  const showResults = election && (election.status === "ENDED" || election.status === "RESULTS_PUBLISHED") && publishedResults;

  // Calculate total positions and candidates for stats
  const totalPositions = election?.positions?.length || 0;
  const totalCandidates = election?.positions?.reduce((acc, pos) => acc + pos.candidates?.length || 0, 0) || 0;

  // NEW: Empty State
  if (!loading && !error && !election) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f3f1fb] via-white to-[#f3f1fb]">
        <PageTitle 
          title="Elect Your Leaders. Shape Your Future." 
          subtitle="Cast your vote for the Computer Engineering Department's student council — secure, transparent, and open to every eligible student." 
        />
        <div className="mx-auto max-w-4xl px-4 pb-16">
          <Card className="p-12 text-center border-0 shadow-2xl shadow-aces-purple-200/30">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-aces-purple-100">
              <Vote className="h-12 w-12 text-aces-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-aces-purple-800">No Active Election</h3>
            <p className="mt-3 text-aces-purple-500 max-w-md mx-auto">
              There's no election scheduled right now. Check back later or contact the ACES coordinator for more information.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button 
                className="bg-aces-purple-600 hover:bg-aces-purple-700"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button 
                variant="outline"
                className="border-aces-purple-300 text-aces-purple-600 hover:bg-aces-purple-50"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
                  <ElectionSkeleton />
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

                    {/* Quick Stats - IMPROVED with better status labels */}
                    {totalPositions > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-aces-purple-50 to-white p-3 text-center shadow-sm">
                          <p className="text-2xl font-bold text-aces-purple-700">{totalPositions}</p>
                          <p className="text-xs font-medium text-aces-purple-400" title="Total elected roles available">
                            Positions
                          </p>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-aces-purple-50 to-white p-3 text-center shadow-sm">
                          <p className="text-2xl font-bold text-aces-purple-700">{totalCandidates}</p>
                          <p className="text-xs font-medium text-aces-purple-400" title="Total candidates running for election">
                            Candidates
                          </p>
                        </div>
                        <div className="rounded-xl bg-gradient-to-br from-aces-purple-50 to-white p-3 text-center shadow-sm">
                          <p className="text-2xl font-bold text-aces-purple-700">
                            {election.status === "LIVE" ? "🔴" : 
                             election.status === "SCHEDULED" ? "⏳" : 
                             election.status === "RESULTS_PUBLISHED" ? "📊" : "⚪"}
                          </p>
                          <p className="text-xs font-medium text-aces-purple-400">
                            {election.status === "LIVE" ? "Voting Active" : 
                             election.status === "SCHEDULED" ? "Upcoming" : 
                             election.status === "RESULTS_PUBLISHED" ? "Results Out" : "Ended"}
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
                  <li key={line} className="group flex items-start gap-3 rounded-xl bg-white/80 p-3.5 sm:p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-white">
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

              {/* NEW: How to Vote Link */}
              <button 
                onClick={() => setShowGuide(true)}
                className="mt-4 text-sm font-medium text-aces-purple-500 hover:text-aces-purple-700 flex items-center gap-1.5 transition-colors hover:underline"
              >
                <HelpCircle className="h-4 w-4" />
                How does voting work?
              </button>
            </div>

            {/* Status Message */}
            {!loading && !isLive && !error && election && (
              <Alert type="info" className="mt-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-500/20 p-2.5">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">
                      {election.status === "SCHEDULED" ? "Voting Not Started Yet" : "Voting Session Inactive"}
                    </p>
                    <p className="text-sm text-blue-700">
                      {election.status === "SCHEDULED" 
                        ? `Voting will begin on ${new Date(election.startAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}`
                        : "Come back once the election status shows <strong className='text-blue-900'>LIVE</strong> to cast your vote."
                      }
                    </p>
                  </div>
                </div>
              </Alert>
            )}

            {/* Action Button - IMPROVED with loading state */}
            <Button
              size="lg"
              className={`mt-8 w-full sm:w-auto ${
                isLive && !votingLoading
                  ? "bg-gradient-to-r from-aces-purple-600 via-aces-purple-700 to-aces-purple-800 hover:from-aces-purple-700 hover:via-aces-purple-800 hover:to-aces-purple-900 shadow-xl shadow-aces-purple-200/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]" 
                  : "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-60"
              } font-semibold px-8 py-4 text-lg group relative overflow-hidden`}
              disabled={!isLive || votingLoading}
              onClick={async () => {
                if (!isLive) return;
                setVotingLoading(true);
                try {
                  await startSession();
                  await loadBallot();
                  navigate("/vote/select");
                } catch (err) {
                  setError(err.message || "Unable to open the ballot right now.");
                  setVotingLoading(false);
                }
              }}
            >
              {isLive && !votingLoading && (
                <span className="absolute inset-0 overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </span>
              )}
              <span className="flex items-center justify-center gap-3 relative z-10">
                {votingLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Starting Voting…</span>
                  </>
                ) : (
                  <>
                    <Vote className={`h-5 w-5 ${isLive ? "group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" : ""}`} />
                    <span>{isLive ? "Start Voting Now" : "Voting Not Available"}</span>
                    <ArrowRight className={`h-5 w-5 ${isLive ? "group-hover:translate-x-1 transition-transform" : ""}`} />
                  </>
                )}
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

      {/* Results Section - IMPROVED with better visibility conditions */}
      {showResults && (
        <section className="mx-auto max-w-4xl px-4 pb-16" id="results">
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
                      
                      {/* IMPROVED: Better handling of no candidates */}
                      {position.candidates.length === 0 ? (
                        <p className="mt-3 font-medium text-aces-purple-400 italic">No candidates registered</p>
                      ) : winner ? (
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
                        <p className="mt-3 font-medium text-aces-purple-600">⚖️ Tie — no winner declared</p>
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

              {/* NEW: Back to top button in results */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-sm font-medium text-aces-purple-500 hover:text-aces-purple-700 flex items-center gap-1.5 transition-colors mx-auto hover:underline"
                >
                  <ArrowUp className="h-4 w-4" />
                  Back to top
                </button>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* NEW: Back to Top Floating Button */}
      <BackToTop />

      {/* NEW: How to Vote Guide Modal */}
      {showGuide && <VotingGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
}