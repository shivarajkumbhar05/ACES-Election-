export default function PageTitle({ eyebrow = "ACES ELECTION PORTAL", title, subtitle }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-10 text-center sm:pt-14">
      <p className="text-xs font-bold tracking-[0.2em] text-aces-purple-500">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-extrabold text-aces-purple-900 sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-aces-purple-700/80">{subtitle}</p>}
      <div className="mx-auto mt-5 h-[2px] w-40 bg-gold-line" />
    </div>
  );
}
