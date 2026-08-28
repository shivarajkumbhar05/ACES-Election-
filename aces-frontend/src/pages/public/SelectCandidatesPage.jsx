import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import StepIndicator from "../../components/StepIndicator";
import CandidateOption from "../../components/CandidateOption";
import { useVoting } from "../../context/VotingContext";

export default function SelectCandidatesPage() {
  const { ballot, sessionToken, selections, selectCandidate, clearSelections, allPositionsSelected, loadBallot } =
    useVoting();
  const [loading, setLoading] = useState(ballot.length === 0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionToken) {
      navigate("/vote", { replace: true });
      return;
    }
    if (ballot.length === 0) {
      loadBallot()
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-aces-purple-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading candidates…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Alert type="error">{error}</Alert>
        <Button className="mt-4" onClick={() => navigate("/vote")}>Back to voting</Button>
      </div>
    );
  }

  return (
    <div className="bg-[#f3f1fb] pb-28">
      <div className="pt-8">
        <StepIndicator current="select" />
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <Card title="Select Candidates" bodyClassName="p-0">
          <div className="max-h-[65vh] overflow-y-auto thin-scroll">
            {ballot.map((group) => (
              <div key={group.position.id} className="border-b border-aces-purple-50 p-5 last:border-none">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-aces-purple-500">
                  {group.position.name}{" "}
                  <span className="ml-1 rounded-full bg-aces-purple-100 px-2 py-0.5 text-[10px] text-aces-purple-600">
                    {group.position.category}
                  </span>
                </p>
                {group.candidates.length === 0 ? (
                  <p className="text-sm italic text-aces-purple-300">No candidates for this position.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {group.candidates.map((c) => (
                      <CandidateOption
                        key={c.id}
                        candidate={c}
                        selected={selections[group.position.id] === c.id}
                        onSelect={() => selectCandidate(group.position.id, c)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-aces-purple-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Button variant="outline" onClick={clearSelections}>
            <RotateCcw className="h-4 w-4" /> Clear All
          </Button>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-aces-purple-400 sm:inline">
              {Object.keys(selections).length}/{ballot.length} positions selected
            </span>
            <Button disabled={!allPositionsSelected} onClick={() => navigate("/vote/review")}>
              Review My Vote <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
