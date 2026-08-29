import { User, Check, Star, Crown } from "lucide-react";
import { useState } from "react";

export default function CandidateOption({ 
  candidate, 
  selected, 
  onSelect,
  showRank = false,
  rank = null,
  disabled = false,
  className = ""
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(candidate)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-pressed={selected}
      disabled={disabled}
      className={`
        group relative w-full rounded-xl border-2 p-4 text-left transition-all duration-300 ease-in-out
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${selected 
          ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-indigo-100/50 shadow-lg shadow-indigo-200/40 scale-[1.02]' 
          : isHovered && !disabled
            ? 'border-indigo-300 bg-indigo-50/50 shadow-md shadow-indigo-200/20 -translate-y-0.5'
            : 'border-indigo-100 bg-white hover:border-indigo-200'
        }
        ${className}
      `}
    >
      {/* Animated Selection Indicator */}
      {selected && (
        <div className="absolute -top-1 -right-1">
          <div className="relative">
            <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/30" />
            <div className="relative rounded-full bg-indigo-600 p-1 shadow-lg shadow-indigo-400/40">
              <Check className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Rank Badge */}
      {showRank && rank && (
        <div className="absolute -top-2 -left-2">
          <div className={`
            flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-md
            ${rank === 1 
              ? 'bg-amber-400 text-indigo-950 shadow-amber-200/50' 
              : rank === 2 
                ? 'bg-gray-300 text-gray-700 shadow-gray-200/50'
                : rank === 3
                  ? 'bg-amber-600 text-white shadow-amber-500/50'
                  : 'bg-indigo-100 text-indigo-600 shadow-indigo-200/50'
            }
          `}>
            {rank === 1 ? <Crown className="h-3.5 w-3.5" /> : rank}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={`
          relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full 
          transition-all duration-300
          ${selected 
            ? 'ring-4 ring-indigo-400/30 ring-offset-2 ring-offset-indigo-50' 
            : isHovered && !disabled
              ? 'ring-2 ring-indigo-300/30 ring-offset-2 ring-offset-white'
              : ''
          }
        `}>
          {candidate.photoUrl ? (
            <img 
              src={candidate.photoUrl} 
              alt={candidate.name} 
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
            />
          ) : (
            <div className={`
              flex h-full w-full items-center justify-center 
              transition-colors duration-300
              ${selected ? 'bg-indigo-200 text-indigo-700' : 'bg-indigo-100 text-indigo-500'}
            `}>
              <User className="h-6 w-6" />
            </div>
          )}
          
          {/* Selected overlay */}
          {selected && (
            <div className="absolute inset-0 bg-indigo-600/10" />
          )}
        </div>

        {/* Candidate Info */}
        <div className="min-w-0 flex-1">
          <p className={`
            truncate text-sm font-semibold transition-colors duration-300
            ${selected ? 'text-indigo-900' : 'text-indigo-900'}
          `}>
            {candidate.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="truncate text-xs text-indigo-500">
              {candidate.className}
            </p>
            {candidate.party && (
              <>
                <span className="h-1 w-1 rounded-full bg-indigo-300" />
                <p className="truncate text-xs text-indigo-400">
                  {candidate.party}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Symbol */}
        {candidate.symbolUrl && (
          <div className={`
            flex h-12 w-12 shrink-0 items-center justify-center rounded-lg 
            transition-all duration-300
            ${selected 
              ? 'bg-indigo-100/50 ring-2 ring-indigo-300/30' 
              : isHovered && !disabled
                ? 'bg-indigo-50'
                : 'bg-gray-50'
            }
          `}>
            <img 
              src={candidate.symbolUrl} 
              alt="Party symbol" 
              className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-110" 
            />
          </div>
        )}

        {/* Selection Radio */}
        <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
          <div className={`
            absolute inset-0 rounded-full border-2 transition-all duration-300
            ${selected 
              ? 'border-indigo-600 bg-indigo-600 shadow-lg shadow-indigo-400/30' 
              : isHovered && !disabled
                ? 'border-indigo-400 bg-indigo-100/30'
                : 'border-indigo-300 bg-white'
            }
            ${disabled ? 'opacity-50' : ''}
          `} />
          
          {selected && (
            <div className="relative z-10 animate-in fade-in zoom-in duration-200">
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </div>
          )}
          
          {!selected && isHovered && !disabled && (
            <div className="absolute inset-1 rounded-full bg-indigo-400/20 animate-pulse" />
          )}
        </div>
      </div>

      {/* Bottom highlight bar for selected state */}
      {selected && (
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-400/0 via-indigo-500 to-indigo-400/0" />
      )}
    </button>
  );
}