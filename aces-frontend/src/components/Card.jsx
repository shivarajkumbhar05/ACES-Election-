import { forwardRef } from "react";

const Card = forwardRef(function Card({
  title,
  action,
  children,
  className = "",
  bodyClassName = "",
  headerClassName = "",
  variant = "default",
  padding = "md",
  shadow = true,
  bordered = false,
  hoverable = false,
  footer = null,
  footerClassName = "",
  headerIcon = null,
  ...props
}, ref) {
  // Variants
  const variantStyles = {
    default: "bg-white",
    primary: "bg-gradient-to-br from-indigo-50 to-indigo-100/50",
    gold: "bg-gradient-to-br from-amber-50 to-amber-100/50",
    dark: "bg-gradient-to-br from-indigo-950 to-indigo-900 text-white",
    ghost: "bg-transparent",
  };

  // Padding sizes
  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
  };

  // Shadow styles
  const shadowStyles = shadow 
    ? "shadow-lg shadow-indigo-200/30" 
    : "";

  // Border styles
  const borderStyles = bordered 
    ? "border border-indigo-200/50" 
    : "";

  // Hover styles
  const hoverStyles = hoverable 
    ? "transition-all duration-300 hover:shadow-xl hover:shadow-indigo-200/40 hover:-translate-y-1 hover:scale-[1.01]" 
    : "";

  // Title text color based on variant
  const titleColor = variant === "dark" 
    ? "text-white" 
    : "text-indigo-950";

  const titleSubColor = variant === "dark"
    ? "text-indigo-300"
    : "text-indigo-500";

  return (
    <section
      ref={ref}
      className={`
        relative overflow-hidden rounded-2xl
        ${variantStyles[variant]}
        ${shadowStyles}
        ${borderStyles}
        ${hoverStyles}
        ${className}
      `}
      {...props}
    >
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-amber-400 to-indigo-400" />

      {/* Header */}
      {(title || action || headerIcon) && (
        <div className={`
          flex items-center justify-between gap-4
          ${variant === "dark" 
            ? "border-indigo-800/50 bg-indigo-900/30" 
            : "border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-transparent"
          }
          border-b px-5 py-3.5
          ${headerClassName}
        `}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {headerIcon && (
              <div className={`
                flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                ${variant === "dark" 
                  ? "bg-indigo-800/50 text-amber-400" 
                  : "bg-indigo-100/50 text-indigo-600"
                }
              `}>
                {headerIcon}
              </div>
            )}
            {title && (
              <div className="min-w-0 flex-1">
                <h3 className={`
                  truncate font-display text-sm font-bold uppercase tracking-wide
                  ${titleColor}
                `}>
                  {title}
                </h3>
                {typeof title === "object" && title.subtitle && (
                  <p className={`truncate text-xs ${titleSubColor}`}>
                    {title.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className={`
        ${paddingStyles[padding]}
        ${bodyClassName}
      `}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className={`
          border-t px-5 py-3.5
          ${variant === "dark" 
            ? "border-indigo-800/50 bg-indigo-900/30 text-indigo-300" 
            : "border-indigo-100 bg-indigo-50/30 text-indigo-600"
          }
          ${footerClassName}
        `}>
          {footer}
        </div>
      )}
    </section>
  );
});

// Sub-components for easier composition
Card.Header = function CardHeader({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-between border-b border-indigo-100 px-5 py-3.5 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = "", padding = "md" }) {
  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
  };
  return (
    <div className={`${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = "" }) {
  return (
    <div className={`border-t border-indigo-100 bg-indigo-50/30 px-5 py-3.5 ${className}`}>
      {children}
    </div>
  );
};

export default Card;