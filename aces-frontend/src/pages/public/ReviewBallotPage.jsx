import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Send, Loader2, User } from "lucide-react";
import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import StepIndicator from "../../components/StepIndicator";
import { useVoting } from "../../context/VotingContext";

export default function ReviewBallotPage() {
  const { ballot, selectedCandidates, allPositionsSelected, submit, sessionToken } = useVoting();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionToken || !allPositionsSelected) {
      navigate(sessionToken ? "/vote/select" : "/vote", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await submit();
      navigate("/vote/confirmation");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#f3f1fb] pb-16">
      <div className="pt-8">
        <StepIndicator current="review" />
      </div>

      <div className="mx-auto max-w-2xl px-4">
        <Card title="Review Your Ballot">
          <p className="mb-4 text-sm text-aces-purple-600">Please review your selections carefully.</p>

          <div className="overflow-hidden rounded-xl border border-aces-purple-100">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-aces-purple-50 text-xs font-bold uppercase tracking-wide text-aces-purple-500">
                  <th className="px-4 py-2.5">Position</th>
                  <th className="px-4 py-2.5">Selected Candidate</th>
                </tr>
              </thead>
              <tbody>
                {ballot.map((group) => {
                  const candidate = selectedCandidates[group.position.id];
                  return (
                    <tr key={group.position.id} className="border-t border-aces-purple-50">
                      <td className="px-4 py-2.5 font-medium text-aces-purple-700">
                        {group.position.name}{" "}
                        <span className="text-xs text-aces-purple-300">({group.position.category})</span>
                      </td>
                      <td className="px-4 py-2.5">
                        {candidate ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-aces-purple-100 text-aces-purple-500">
                              {candidate.photoUrl ? (
                                <img src={candidate.photoUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-3.5 w-3.5" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-aces-purple-900">{candidate.name}</p>
                              <p className="text-xs text-aces-purple-400">{candidate.className}</p>
                            </div>
                            {candidate.symbolUrl && <img src={candidate.symbolUrl} alt="" className="h-7 w-7 object-contain" />}
                          </div>
                        ) : (
                          <span className="italic text-aces-purple-300">Not selected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Alert type="warning" className="mt-5">
            Please carefully review your selections. Once submitted, your vote cannot be changed.
          </Alert>

          {error && <Alert type="error" className="mt-3">{error}</Alert>}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => navigate("/vote/select")}>
              <ArrowLeft className="h-4 w-4" /> Edit Selections
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit My Vote
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
