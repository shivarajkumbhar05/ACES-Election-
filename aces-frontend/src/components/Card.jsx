export default function Card({ title, action, children, className = "", bodyClassName = "" }) {
  return (
    <section className={`overflow-hidden rounded-2xl bg-white shadow-card ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-aces-purple-50 bg-aces-purple-900 px-5 py-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            {title}
          </h3>
          {action}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
