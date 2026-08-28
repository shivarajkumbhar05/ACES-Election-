import { GraduationCap } from "lucide-react";

function Crest({ side = "left" }) {
  return (
    <div
      className={`hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-aces-gold-400 bg-aces-purple-900/40 ${
        side === "left" ? "" : ""
      }`}
      aria-hidden="true"
    >
      <GraduationCap className="h-8 w-8 text-aces-gold-400" strokeWidth={1.75} />
    </div>
  );
}

export default function CollegeHeader() {
  return (
    <header className="bg-gradient-to-r from-aces-purple-900 via-aces-purple-800 to-aces-purple-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6">
        <Crest side="left" />
        <div className="flex-1 text-center">
          <p className="text-[11px] font-semibold tracking-wide text-aces-gold-300 sm:text-xs">
            SHREE VATAVRUKSHA SWAMI MAHARAJ DEVASTHAN'S
          </p>
          <h1 className="mt-0.5 font-display text-base font-bold leading-tight sm:text-xl md:text-2xl">
            KAI. KALYANRAO (BALASAHEB) INGALE POLYTECHNIC COLLEGE, AKKALKOT
          </h1>
          <p className="mt-0.5 text-[11px] font-medium tracking-wide text-aces-purple-100 sm:text-sm">
            COMPUTER ENGINEERING DEPARTMENT
          </p>
        </div>
        <Crest side="right" />
      </div>
      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-aces-gold-400 to-transparent" />
    </header>
  );
}
