import { Check } from "lucide-react";

const STEPS = [
  { key: "select", label: "Select" },
  { key: "review", label: "Review" },
  { key: "submit", label: "Submit" },
  { key: "confirmation", label: "Confirmation" },
];

export default function StepIndicator({ current }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <ol className="mx-auto mb-8 flex max-w-md items-center justify-between px-4">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isDone
                    ? "bg-aces-purple-700 text-white"
                    : isCurrent
                    ? "bg-aces-gold-400 text-aces-purple-900 ring-4 ring-aces-gold-100"
                    : "bg-aces-purple-100 text-aces-purple-400"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  isCurrent ? "text-aces-purple-900" : "text-aces-purple-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded ${
                  isDone ? "bg-aces-purple-700" : "bg-aces-purple-100"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
