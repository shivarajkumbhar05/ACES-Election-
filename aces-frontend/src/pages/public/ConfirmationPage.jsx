import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Card from "../../components/Card";
import StepIndicator from "../../components/StepIndicator";
import { useVoting } from "../../context/VotingContext";

const REDIRECT_SECONDS = 1;

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    /* Web Audio unavailable — silently skip the beep */
  }
}

export default function ConfirmationPage() {
  const { submission, sessionToken, resetForNextVoter } = useVoting();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const navigate = useNavigate();
  const beepedRef = useRef(false);

  useEffect(() => {
    if (!sessionToken && !submission) {
      navigate("/vote", { replace: true });
      return;
    }
    if (!beepedRef.current) {
      playBeep();
      beepedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      goToNextVoter();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  function goToNextVoter() {
    resetForNextVoter();
    navigate("/vote");
  }

  return (
    <div className="bg-[#f3f1fb] pb-16">
      <div className="pt-8">
        <StepIndicator current="confirmation" />
      </div>

      <div className="mx-auto max-w-md px-4">
        <Card bodyClassName="flex flex-col items-center py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-11 w-11 text-emerald-600" />
          </div>
          <h3 className="mt-5 font-display text-xl font-bold text-aces-purple-900">
            Vote Recorded Successfully!
          </h3>
          <p className="mt-1 text-sm text-aces-purple-500">
            Thank you for participating in ACES Election.
          </p>

          <div className="mt-5 flex h-10 items-end justify-center gap-1" aria-hidden="true">
            {[6, 14, 22, 14, 26, 10, 20, 8, 16].map((h, i) => (
              <span
                key={i}
                className="voice-bar w-1.5 rounded-full bg-aces-purple-400"
                style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-aces-purple-400">Beep!</p>

          {submission?.ballotId && (
            <p className="mt-4 text-[11px] text-aces-purple-300">
              Ballot reference: {submission.ballotId}
            </p>
          )}

          <div className="mt-6 w-full rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Redirecting to hand off to the next voter…
            <br />
            You will be redirected in {secondsLeft} sec.
          </div>

          <p className="mt-3 text-xs text-aces-purple-400">Preparing the next direct ballot…</p>
        </Card>
      </div>
    </div>
  );
}
