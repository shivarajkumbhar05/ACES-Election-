import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ title, onClose, children, footer, size = "md" }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className={`w-full ${widths[size]} overflow-hidden rounded-2xl bg-white shadow-panel`}>
        <div className="flex items-center justify-between border-b border-aces-purple-50 px-5 py-3.5">
          <h3 className="font-display text-base font-bold text-aces-purple-900">{title}</h3>
          <button onClick={onClose} className="text-aces-purple-300 hover:text-aces-purple-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5 thin-scroll">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-aces-purple-50 px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}
