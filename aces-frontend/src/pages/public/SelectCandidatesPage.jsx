import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  RotateCcw, 
  Loader2,
  CheckCircle2,
  Award,
  Users,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Shield
} from "lucide-react";
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
  const [expandedPosition, setExpandedPosition] = useState(null);
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

  const selectedCount = Object.keys(selections).length;
  const totalPositions = ballot.length;
  const progressPercentage = totalPositions > 0 ? (selectedCount / totalPositions) * 100 : 0;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-aces-purple-500">
        <Loader2 className="h-12 w-12 animate-spin text-aces-purple-400" />
        <p className="mt-4 text-sm font-medium text-aces-purple-500">Loading candidates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Alert type="error" className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100/50 shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-800">{error}</span>
          </div>
        </Alert>
        <Button className="mt-4" onClick={() => navigate("/vote")}>
          Back to Voting
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f1fb] via-white to-[#f3f1fb] pb-32">
      <div className="pt-8">
        <StepIndicator current="select" />
      </div>

      <div className="mx-auto max-w-4xl px-4">
        {/* Progress Header */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aces-purple-100">
                <Users className="h-5 w-5 text-aces-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-aces-purple-900">
                  Select Your Candidates
                </p>
                <p className="text-xs text-aces-purple-500">
                  Choose one candidate for each position
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-aces-purple-900">
                  {selectedCount}/{totalPositions}
                </p>
                <p className="text-[10px] text-aces-purple-400">Selected</p>
              </div>
              <div className="h-10 w-px bg-aces-purple-200" />
              <div className="w-24">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-aces-purple-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-aces-purple-400 to-aces-purple-600 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-aces-purple-400 text-center">
                  {Math.round(progressPercentage)}% complete
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ballot Cards */}
        <Card className="border-0 shadow-xl shadow-aces-purple-200/30">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-aces-purple-400 via-aces-purple-600 to-aces-purple-800" />
          
          <div className="p-6 md:p-8">
            <div className="space-y-4">
              {ballot.map((group) => {
                const isSelected = selections[group.position.id] !== undefined;
                const isExpanded = expandedPosition === group.position.id;
                
                return (
                  <div
                    key={group.position.id}
                    className={`rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-aces-purple-100 bg-white hover:border-aces-purple-200'
                    }`}
                  >
                    {/* Position Header */}
                    <div
                      className="flex cursor-pointer items-center justify-between p-4"
                      onClick={() => setExpandedPosition(isExpanded ? null : group.position.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isSelected ? 'bg-emerald-100' : 'bg-aces-purple-100'
                        }`}>
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Award className="h-4 w-4 text-aces-purple-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-aces-purple-900">
                            {group.position.name}
                          </p>
                          <p className="text-xs text-aces-purple-400">
                            {group.position.category} • {group.candidates.length} candidate{group.candidates.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isSelected && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            Selected
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-aces-purple-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-aces-purple-400" />
                        )}
                      </div>
                    </div>

                    {/* Candidates Grid */}
                    {isExpanded && (
                      <div className="border-t border-aces-purple-100 p-4">
                        {group.candidates.length === 0 ? (
                          <p className="text-sm italic text-aces-purple-300 text-center py-4">
                            No candidates for this position.
                          </p>
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t-2 border-aces-purple-100/50 bg-white/95 backdrop-blur-md shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Button 
            variant="outline" 
            onClick={clearSelections}
            className="border-2 border-aces-purple-200 text-aces-purple-600 hover:bg-aces-purple-50"
          >
            <RotateCcw className="h-4 w-4" /> Clear All
          </Button>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="text-right">
                <span className="text-xs font-medium text-aces-purple-600">
                  {selectedCount}/{totalPositions} positions
                </span>
              </div>
              <div className="h-6 w-px bg-aces-purple-200" />
              <div className="flex items-center gap-1.5">
                {allPositionsSelected ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-xs text-aces-purple-500">
                  {allPositionsSelected ? 'Ready to review' : `${totalPositions - selectedCount} remaining`}
                </span>
              </div>
            </div>
            <Button 
              disabled={!allPositionsSelected} 
              onClick={() => navigate("/vote/review")}
              className={`${
                allPositionsSelected 
                  ? 'bg-gradient-to-r from-aces-purple-600 to-aces-purple-700 text-white shadow-lg shadow-aces-purple-200/50 hover:from-aces-purple-700 hover:to-aces-purple-800' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Review My Vote 
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}