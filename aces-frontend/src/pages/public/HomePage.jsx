import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Vote, CheckCircle2, ArrowRight, Calendar, Building2, Loader2 } from "lucide-react";
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
    LIVE: "bg-emerald-100 text-emerald-700",
    SCHEDULED: "bg-amber-100 text-amber-700",
    ENDED: "bg-red-100 text-red-700",
    RESULTS_PUBLISHED: "bg-aces-purple-100 text-aces-purple-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${map[status] || "bg-gray-100 text-gray-600"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status?.replaceAll("_", " ")}
    </span>
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

  return (
    <div className="bg-[#f3f1fb]">
      <PageTitle title="Elect Your Leaders. Shape Your Future." subtitle="Cast your vote for the Computer Engineering Department's student council — secure, transparent, and open to every eligible student." />

      <div className="mx-auto max-w-3xl px-4 pb-16">
        <Card className="border border-aces-purple-100">
          <div className="flex flex-col gap-6 p-1 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-aces-purple-900 text-white shadow-panel">
              <Vote className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-aces-purple-900">
                ACES Election Portal
              </h3>

              {loading ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-aces-purple-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading election details…
                </div>
              ) : error ? (
                <Alert type="warning" className="mt-4">{error}</Alert>
              ) : election ? (
                <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  <div className="flex justify-between border-b border-dashed border-aces-purple-100 py-1.5 sm:justify-start sm:gap-2">
                    <dt className="text-aces-purple-500">Election Body</dt>
                    <dd className="font-semibold text-aces-purple-900">ACES Student Body</dd>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-aces-purple-100 py-1.5 sm:justify-start sm:gap-2">
                    <dt className="flex items-center gap-1 text-aces-purple-500">
                      <Building2 className="h-3.5 w-3.5" /> Department
                    </dt>
                    <dd className="font-semibold text-aces-purple-900">{election.department}</dd>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-aces-purple-100 py-1.5 sm:justify-start sm:gap-2">
                    <dt className="flex items-center gap-1 text-aces-purple-500">
                      <Calendar className="h-3.5 w-3.5" /> Election Date
                    </dt>
                    <dd className="font-semibold text-aces-purple-900">
                      {new Date(election.startAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-1.5 sm:justify-start sm:gap-2">
                    <dt className="text-aces-purple-500">Status</dt>
                    <dd><StatusPill status={election.status} /></dd>
                  </div>
                </dl>
              ) : null}
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-aces-purple-50/70 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-aces-purple-600">
              Instructions
            </p>
            <ul className="space-y-1.5">
              {INSTRUCTIONS.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-aces-purple-800">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {!loading && !isLive && !error && (
            <Alert type="info" className="mt-5">
              Voting isn't open right now. Come back once the election status shows{" "}
              <strong>LIVE</strong>.
            </Alert>
          )}

          <Button
            size="lg"
            className="mt-6 w-full sm:w-auto"
            disabled={!isLive}
            onClick={() => navigate("/vote")}
          >
            Start Voting <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="mt-6 flex flex-col justify-between gap-1 border-t border-aces-purple-50 pt-4 text-xs text-aces-purple-400 sm:flex-row">
            <span>HOD: Gaikawad S.T.</span>
            <span>ACES Coordinator: Nigadale G.A.</span>
          </div>
        </Card>
      </div>
      {publishedResults && (
        <section className="mx-auto max-w-3xl px-4 pb-16">
          <Card title="Election Results" action={<span className="text-xs text-white/70">Official declaration</span>}>
            <div className="grid gap-3 sm:grid-cols-2">
              {publishedResults.positions.map((position) => {
                const winner = position.candidates.find((candidate) => candidate.isWinner);
                return <div key={position.positionId} className="rounded-lg border border-aces-purple-100 p-3"><p className="text-xs font-semibold text-aces-purple-500">{position.positionName}</p><p className="mt-1 font-bold text-aces-purple-900">{winner?.name || "Tie / no winner"}</p>{winner && <p className="text-xs text-aces-purple-400">{winner.votes} votes</p>}</div>;
              })}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
