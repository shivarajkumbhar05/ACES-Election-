import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Send, 
  Loader2, 
  User,
  CheckCircle2,
  FileCheck,
  Shield,
  Clock,
  Award,
  ChevronRight,
  Eye,
  Lock
} from "lucide-react";
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

  const totalPositions = ballot.length;
  const selectedCount = Object.keys(selectedCandidates).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f1fb] to-white pb-16">
      <div className="pt-8">
        <StepIndicator current="review" />
      </div>

      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-aces-purple-600 to-aces-purple-800 text-white shadow-lg shadow-aces-purple-200/50">
            <FileCheck className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-aces-purple-900">Review Your Ballot</h1>
          <p className="mt-1 text-sm text-aces-purple-500">
            Please review your selections carefully before submitting.
          </p>
        </div>

        <Card className="relative overflow-hidden border-0 shadow-xl shadow-aces-purple-200/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aces-purple-400 via-aces-purple-600 to-aces-purple-800" />
          
          <div className="p-6 md:p-8">
            {/* Stats Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-aces-purple-50/70 p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-aces-purple-500" />
                  <span className="text-sm text-aces-purple-600">
                    <span className="font-bold text-aces-purple-900">{totalPositions}</span> Positions
                  </span>
                </div>
                <div className="h-4 w-px bg-aces-purple-200" />
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-aces-purple-600">
                    <span className="font-bold text-emerald-600">{selectedCount}</span> Selected
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <Clock className="h-3.5 w-3.5 text-aces-purple-400" />
                <span className="text-xs text-aces-purple-500">Review before submitting</span>
              </div>
            </div>

            {/* Ballot Table */}
            <div className="overflow-hidden rounded-xl border-2 border-aces-purple-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-aces-purple-50 to-aces-purple-100/50 text-xs font-bold uppercase tracking-wide text-aces-purple-500">
                      <th className="px-4 py-3.5">Position</th>
                      <th className="px-4 py-3.5">Selected Candidate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ballot.map((group, index) => {
                      const candidate = selectedCandidates[group.position.id];
                      return (
                        <tr 
                          key={group.position.id} 
                          className={`border-t border-aces-purple-50 transition-all hover:bg-aces-purple-50/30 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-aces-purple-50/20'
                          }`}
                        >
                          <td className="px-4 py-3.5">
                            <span className="font-medium text-aces-purple-800">
                              {group.position.name}
                            </span>
                            <span className="ml-2 text-xs text-aces-purple-400">
                              ({group.position.category})
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {candidate ? (
                              <div className="flex items-center gap-3">
                                {/* Photo */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-aces-purple-100 to-aces-purple-200">
                                  {candidate.photoUrl ? (
                                    <img 
                                      src={candidate.photoUrl} 
                                      alt={candidate.name} 
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-4 w-4 text-aces-purple-500" />
                                  )}
                                </div>
                                
                                {/* Candidate Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-aces-purple-900 truncate">
                                    {candidate.name}
                                  </p>
                                  <p className="text-xs text-aces-purple-400">
                                    {candidate.className}
                                  </p>
                                </div>

                                {/* Symbol */}
                                {candidate.symbolUrl && (
                                  <div className="shrink-0">
                                    <img 
                                      src={candidate.symbolUrl} 
                                      alt="Symbol" 
                                      className="h-8 w-8 rounded-lg border border-aces-purple-100 object-contain p-1"
                                    />
                                  </div>
                                )}

                                {/* Selected Badge */}
                                <div className="shrink-0">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Selected
                                  </span>
                                </div>
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
            </div>

            {/* Warning Alert */}
            <Alert type="warning" className="mt-6 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 shadow-md">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-amber-500/20 p-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800">Final Review Required</p>
                  <p className="text-sm text-amber-700">
                    Please carefully review your selections. Once submitted, your vote <strong>cannot be changed</strong>.
                  </p>
                </div>
              </div>
            </Alert>

            {error && (
              <Alert type="error" className="mt-4 border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span className="text-sm font-medium text-red-800">{error}</span>
                </div>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate("/vote/select")}
                className="border-2 border-aces-purple-200 text-aces-purple-600 hover:bg-aces-purple-50"
              >
                <ArrowLeft className="h-4 w-4" /> Edit Selections
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit My Vote
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Security Footer */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t-2 border-aces-purple-100/50 pt-5 text-xs text-aces-purple-400">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>Secure Voting</span>
              </div>
              <span className="text-aces-purple-300">•</span>
              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span>Private Ballot</span>
              </div>
              <span className="text-aces-purple-300">•</span>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                <span>One Vote Per Student</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}