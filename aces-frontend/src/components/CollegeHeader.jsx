import { GraduationCap, School, Award, Calendar, Sparkles } from "lucide-react";

function Crest({ side = "left" }) {
  return (
    <div
      className={`hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-amber-400/60 bg-gradient-to-br from-indigo-900/80 to-indigo-950/80 backdrop-blur-sm shadow-lg shadow-amber-400/10 transition-all duration-300 hover:scale-105 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-400/20 ${
        side === "left" ? "lg:flex" : "lg:flex"
      }`}
      aria-hidden="true"
    >
      <GraduationCap className="h-8 w-8 text-amber-400 drop-shadow-lg" strokeWidth={1.75} />
    </div>
  );
}

export default function CollegeHeader() {
  const currentYear = new Date().getFullYear();

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 shadow-2xl shadow-indigo-950/60">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-amber-400/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-400/5 blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      </div>

      {/* Top Decorative Line */}
      <div className="relative h-[1px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
      </div>

      <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:gap-6 lg:py-5">
        {/* Left Crest */}
        <Crest side="left" />

        {/* Main Content */}
        <div className="flex-1 text-center space-y-1.5">
          {/* Trust Name */}
          <div className="flex items-center justify-center gap-3">
            <span className="hidden h-px w-8 bg-gradient-to-r from-transparent to-amber-400/30 sm:block" />
            <p className="text-[10px] font-semibold tracking-[0.15em] text-amber-300/80 uppercase sm:text-[11px] md:text-xs">
              Shree Vatavruksha Swami Maharaj Devasthan's
            </p>
            <span className="hidden h-px w-8 bg-gradient-to-l from-transparent to-amber-400/30 sm:block" />
          </div>

          {/* College Name */}
          <h1 className="font-display text-sm font-bold leading-tight tracking-wide text-white sm:text-base md:text-xl lg:text-2xl">
            <span className="relative inline-block">
              KAI. KALYANRAO (BALASAHEB) INGALE POLYTECHNIC COLLEGE, AKKALKOT
              <span className="absolute -bottom-1 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
            </span>
          </h1>

          {/* Department with Icon */}
          <div className="flex items-center justify-center gap-2">
            <School className="h-3 w-3 text-amber-400/70 sm:h-3.5 sm:w-3.5" />
            <p className="text-[10px] font-semibold tracking-wider text-indigo-200 sm:text-xs md:text-sm">
              <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                COMPUTER ENGINEERING DEPARTMENT
              </span>
            </p>
          </div>

          {/* Badges */}
          <div className="mt-1 flex items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-indigo-900/40 px-3 py-0.5 backdrop-blur-sm">
              <Calendar className="h-2.5 w-2.5 text-amber-400/60" />
              <span className="text-[8px] font-medium text-amber-300/70 sm:text-[9px]">
                AY {currentYear}-{currentYear + 1}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-900/40 px-3 py-0.5 backdrop-blur-sm">
              <Award className="h-2.5 w-2.5 text-amber-400/60" />
              <span className="text-[8px] font-medium text-indigo-300/70 sm:text-[9px]">
                Accredited
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-indigo-900/40 px-3 py-0.5 backdrop-blur-sm">
              <Sparkles className="h-2.5 w-2.5 text-amber-400/60" />
              <span className="text-[8px] font-medium text-amber-300/70 sm:text-[9px]">
                Excellence
              </span>
            </div>
          </div>
        </div>

        {/* Right Crest */}
        <Crest side="right" />
      </div>

      {/* Bottom Gold Line */}
      <div className="relative h-[3px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent blur-md" />
      </div>
    </header>
  );
}