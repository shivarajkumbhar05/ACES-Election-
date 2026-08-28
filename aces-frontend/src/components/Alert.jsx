import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const STYLES = {
  info: { wrap: "bg-aces-purple-50 border-aces-purple-200 text-aces-purple-800", Icon: Info },
  warning: { wrap: "bg-amber-50 border-amber-200 text-amber-800", Icon: AlertTriangle },
  success: { wrap: "bg-emerald-50 border-emerald-200 text-emerald-800", Icon: CheckCircle2 },
  error: { wrap: "bg-red-50 border-red-200 text-red-700", Icon: XCircle },
};

export default function Alert({ type = "info", children, className = "" }) {
  const { wrap, Icon } = STYLES[type];
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${wrap} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
