import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  error?: unknown;
  onRetry: () => void;
}

/** Shown by the error boundary when the catalog request fails. */
export default function CatalogError({ error, onRetry }: Props) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : 'حدث خطأ غير متوقع أثناء تحميل المنتجات.';

  return (
    <section className="bg-[#f5f9fe] py-16 md:py-24" role="alert">
      <div className="max-w-xl mx-auto px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#1565c0]/10 grid place-items-center mb-4">
          <AlertTriangle size={30} className="text-[#1565c0]" />
        </div>
        <h2 className="font-black text-2xl text-[#0f2f52] mb-2">تعذّر تحميل المنتجات</h2>
        <p className="text-sm font-bold text-[#0f2f52]/60 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-[#1565c0] hover:bg-[#0d47a1] text-white font-black px-6 py-3 rounded-full transition-all active:scale-95"
        >
          <RefreshCw size={17} /> إعادة المحاولة
        </button>
      </div>
    </section>
  );
}
