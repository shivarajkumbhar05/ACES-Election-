import { User } from "lucide-react";

export default function CandidateOption({ candidate, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(candidate)}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
        selected
          ? "border-aces-purple-600 bg-aces-purple-50 shadow-card"
          : "border-aces-purple-100 bg-white hover:border-aces-purple-300"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-aces-purple-100 text-aces-purple-500">
        {candidate.photoUrl ? (
          <img src={candidate.photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <User className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-aces-purple-900">{candidate.name}</p>
        <p className="text-xs text-aces-purple-400">{candidate.className}</p>
      </div>
      {candidate.symbolUrl && <img src={candidate.symbolUrl} alt="" className="h-9 w-9 shrink-0 object-contain" />}
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-aces-purple-600" : "border-aces-purple-200"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-aces-purple-600" />}
      </span>
    </button>
  );
}
