import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-xs text-slate-400">Page {page} sur {totalPages}</p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={15} className="text-slate-600" />
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 transition-colors"
        >
          <ChevronRight size={15} className="text-slate-600" />
        </button>
      </div>
    </div>
  );
}
