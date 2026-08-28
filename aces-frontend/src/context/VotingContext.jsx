import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { getBallotCandidates, submitBallot } from "../api/voting";

const VotingContext = createContext(null);

export function VotingProvider({ children }) {
  const [sessionToken, setSessionToken] = useState(() =>
    sessionStorage.getItem("aces_voting_session")
  );
  const [ballot, setBallot] = useState([]); // [{ position, candidates }]
  const [selections, setSelections] = useState({}); // positionId -> candidateId
  const [selectedCandidates, setSelectedCandidates] = useState({}); // positionId -> candidate object
  const [submission, setSubmission] = useState(null); // { ballotId, submittedAt }

  const startSession = useCallback(async () => {
    const directVotingSession = "direct-voting";
    sessionStorage.setItem("aces_voting_session", directVotingSession);
    setSessionToken(directVotingSession);
    return directVotingSession;
  }, []);

  const loadBallot = useCallback(async () => {
    const data = await getBallotCandidates();
    setBallot(data);
    return data;
  }, []);

  const selectCandidate = useCallback((positionId, candidate) => {
    setSelections((prev) => ({ ...prev, [positionId]: candidate.id }));
    setSelectedCandidates((prev) => ({ ...prev, [positionId]: candidate }));
  }, []);

  const clearSelections = useCallback(() => {
    setSelections({});
    setSelectedCandidates({});
  }, []);

  const allPositionsSelected = useMemo(() => {
    if (ballot.length === 0) return false;
    return ballot.every((group) => !!selections[group.position.id]);
  }, [ballot, selections]);

  const submit = useCallback(async () => {
    const payload = Object.entries(selections).map(([positionId, candidateId]) => ({
      positionId,
      candidateId,
    }));
    const result = await submitBallot(payload);
    setSubmission(result);
    return result;
  }, [selections]);

  const resetForNextVoter = useCallback(() => {
    sessionStorage.removeItem("aces_voting_session");
    setSessionToken(null);
    setBallot([]);
    setSelections({});
    setSelectedCandidates({});
    setSubmission(null);
  }, []);

  return (
    <VotingContext.Provider
      value={{
        sessionToken,
        ballot,
        selections,
        selectedCandidates,
        allPositionsSelected,
        submission,
        startSession,
        loadBallot,
        selectCandidate,
        clearSelections,
        submit,
        resetForNextVoter,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const ctx = useContext(VotingContext);
  if (!ctx) throw new Error("useVoting must be used within VotingProvider");
  return ctx;
}
