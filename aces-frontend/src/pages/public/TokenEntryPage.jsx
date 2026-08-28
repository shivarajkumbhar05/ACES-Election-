import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Vote } from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import PageTitle from "../../components/PageTitle";
import { useVoting } from "../../context/VotingContext";

export default function TokenEntryPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { startSession, loadBallot } = useVoting();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await startSession();
      await loadBallot();
      navigate("/vote/select");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#f3f1fb] pb-16">
      <PageTitle
        title="Cast Your Vote"
        subtitle="Voting is open. Select your choices carefully before submitting your ballot."
      />
      <div className="mx-auto max-w-md px-4">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert type="error">{error}</Alert>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Vote className="h-4 w-4" /> Continue to Ballot <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-aces-purple-400">
            You can submit only while the election is open.
          </p>
        </Card>
      </div>
    </div>
  );
}
