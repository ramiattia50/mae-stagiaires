import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ titre, message, confirmLabel = "Confirmer", danger = false, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-xl animate-[slideIn_0.2s_ease-out]">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 ${danger ? "bg-red-50" : "bg-amber-50"}`}>
          <AlertTriangle size={20} className={danger ? "text-red-600" : "text-amber-600"} />
        </div>
        <h2 className="font-display text-base font-bold text-mae-blue mb-1.5">{titre}</h2>
        <p className="text-sm text-slate-500 mb-5">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-300 rounded-xl py-2.5 text-sm font-medium text-slate-600"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium text-white active:scale-[0.98] transition-transform ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-mae-blue hover:bg-mae-blue/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
