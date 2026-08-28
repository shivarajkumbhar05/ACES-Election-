import { forwardRef } from "react";

const VARIANTS = {
  primary:
    "bg-aces-purple-700 text-white hover:bg-aces-purple-800 focus-visible:outline-aces-purple-700 disabled:bg-aces-purple-300",
  gold: "bg-aces-gold-400 text-aces-purple-900 hover:bg-aces-gold-500 disabled:bg-aces-gold-300/60",
  outline:
    "border border-aces-purple-200 bg-white text-aces-purple-700 hover:bg-aces-purple-50 disabled:text-aces-purple-300",
  ghost: "text-aces-purple-700 hover:bg-aces-purple-50 disabled:text-aces-purple-300",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const Button = forwardRef(function Button(
  { variant = "primary", size = "md", className = "", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:shadow-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
