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
    <div className="mx-auto mb-8 max-w-2xl px-4">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === STEPS.length - 1;
          
          return (
            <li 
              key={step.key} 
              className={`flex items-center ${!isLast ? 'flex-1' : ''}`}
            >
              <div className="flex flex-col items-center gap-1.5">
                {/* Step Circle */}
                <div className="relative">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                      isDone
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200/50"
                        : isCurrent
                        ? "bg-amber-400 text-indigo-950 shadow-lg shadow-amber-200/50 ring-4 ring-amber-100 scale-105"
                        : "bg-indigo-100 text-indigo-400"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </div>
                  
                  {/* Current step pulse ring */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping" />
                  )}
                </div>
                
                {/* Step Label */}
                <span
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    isCurrent 
                      ? "text-indigo-900" 
                      : isDone 
                      ? "text-indigo-600" 
                      : "text-indigo-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-3">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      isDone ? "bg-emerald-400" : "bg-indigo-200"
                    }`}
                  >
                    {/* Animated progress fill */}
                    {isCurrent && (
                      <div className="h-full w-1/2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      
      {/* Progress indicator */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium text-indigo-400">
          Step {currentIndex + 1} of {STEPS.length}
        </span>
        <div className="flex-1 h-1 rounded-full bg-indigo-100 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-medium text-indigo-400">
          {Math.round(((currentIndex + 1) / STEPS.length) * 100)}%
        </span>
      </div>
    </div>
  );
}