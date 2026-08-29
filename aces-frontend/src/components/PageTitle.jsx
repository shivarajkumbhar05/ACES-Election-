import { Sparkles, Crown, Award, ChevronRight } from "lucide-react";

export default function PageTitle({ 
  eyebrow = "ACES ELECTION PORTAL", 
  title, 
  subtitle,
  centered = true,
  withIcon = true,
  withDecoration = true,
  className = "",
  eyebrowClassName = "",
  titleClassName = "",
  subtitleClassName = "",
  icon = null,
  badge = null,
}) {
  const alignmentStyles = centered 
    ? "text-center items-center" 
    : "text-left items-start";

  return (
    <div className={`
      relative mx-auto max-w-4xl px-4 pb-10 pt-8 sm:pt-12
      ${alignmentStyles}
      ${className}
    `}>
      {/* Decorative background element */}
      {withDecoration && (
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-indigo-400/5 blur-3xl" />
      )}
      
      {/* Eyebrow with decorative line */}
      <div className={`
        flex items-center gap-3
        ${centered ? 'justify-center' : 'justify-start'}
        ${eyebrowClassName}
      `}>
        {withDecoration && (
          <span className="hidden h-px w-8 bg-gradient-to-r from-transparent to-indigo-400/30 sm:block" />
        )}
        
        <div className="flex items-center gap-2">
          {withIcon && (
            <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
          )}
          <p className="text-[10px] font-bold tracking-[0.25em] text-indigo-500 uppercase sm:text-xs">
            {eyebrow}
          </p>
          {withIcon && (
            <Sparkles className="h-3 w-3 text-amber-400 animate-pulse delay-700" />
          )}
        </div>
        
        {withDecoration && (
          <span className="hidden h-px w-8 bg-gradient-to-l from-transparent to-indigo-400/30 sm:block" />
        )}
      </div>

      {/* Title with gradient and glow */}
      <div className={`
        relative mt-3
        ${centered ? 'text-center' : 'text-left'}
      `}>
        <h2 className={`
          relative font-display font-extrabold leading-tight
          text-3xl sm:text-4xl md:text-5xl lg:text-6xl
          bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800
          bg-clip-text text-transparent
          ${titleClassName}
        `}>
          {/* Title Icon */}
          {icon && (
            <span className="inline-block mr-2 text-amber-500">
              {icon}
            </span>
          )}
          
          {title}
          
          {/* Subtle glow behind title */}
          {withDecoration && (
            <span className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-gradient-to-r from-amber-400/20 via-indigo-400/20 to-amber-400/20" />
          )}
        </h2>
        
        {/* Decorative underline with gradient */}
        {withDecoration && (
          <div className={`
            mt-3 flex
            ${centered ? 'justify-center' : 'justify-start'}
          `}>
            <div className="relative h-1 w-24 overflow-hidden rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400">
              <div className="absolute inset-0 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
        )}
      </div>

      {/* Subtitle with enhanced styling */}
      {subtitle && (
        <div className={`
          mt-4 max-w-2xl
          ${centered ? 'mx-auto text-center' : 'text-left'}
          ${subtitleClassName}
        `}>
          <p className="text-sm leading-relaxed text-indigo-600/80 sm:text-base">
            {subtitle}
          </p>
        </div>
      )}

      {/* Badge */}
      {badge && (
        <div className={`
          mt-4
          ${centered ? 'flex justify-center' : 'flex justify-start'}
        `}>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50/80 px-4 py-1.5 border border-amber-200/50 backdrop-blur-sm shadow-sm shadow-amber-200/20">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-700">{badge}</span>
            <ChevronRight className="h-3 w-3 text-amber-400" />
          </div>
        </div>
      )}

      {/* Stats or additional info could go here */}
      <div className={`
        mt-6 flex flex-wrap gap-4
        ${centered ? 'justify-center' : 'justify-start'}
      `}>
        <div className="flex items-center gap-2 text-xs text-indigo-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Results</span>
        </div>
        <span className="text-indigo-200">|</span>
        <div className="flex items-center gap-2 text-xs text-indigo-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span>Verified</span>
        </div>
      </div>
    </div>
  );
}