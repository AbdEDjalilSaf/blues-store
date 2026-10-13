import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { CheckCircle2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { formatPrice, resolveImageUrl, fallbackImage, type ApiProduct } from '../lib/api';
import ErrorBoundary from '../components/ErrorBoundary';
import { resetAdminProducts, useAdminProducts } from './productCache';
import Pagination from './Pagination';
import { ProductsEmpty, ProductsError, ProductsPageSkeleton } from './ProductsStates';

/** The form (and its upload UI) ships in its own chunk, opened on demand. */
const ProductFormModal = lazy(() => import('./ProductFormModal'));

const PAGE_SIZE = 8;

function primaryImage(product: ApiProduct): string {
  const images = product.images ?? [];
  if (images.length === 0) return fallbackImage(product.team);
  const primary =
    images.find((img) => img.is_primary) ??
    [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
  const resolved = resolveImageUrl(primary.path);
  return resolved || fallbackImage(product.team);
}

/** Swap to the deterministic placeholder when the stored file can't be loaded. */
function handleImageError(event: SyntheticEvent<HTMLImageElement>, team: string): void {
  const img = event.currentTarget;
  img.onerror = null;
  img.src = fallbackImage(team);
}

interface ManagerProps {
  showToast: (message: string) => void;
}

/**
 * Data-bound view. Suspends on `useAdminProducts()` so the parent `<Suspense>`
 * shows the skeleton until the API responds.
 */
function ProductsManager({ showToast }: ManagerProps) {
  const apiProducts = useAdminProducts();
  const [items, setItems] = useState<ApiProduct[]>(apiProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiProduct | null>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp during render so the page stays valid after filtering or deleting rows.
  const currentPage = Math.min(page, totalPages);

  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((product: ApiProduct) => {
    setEditing(product);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const handleCreated = useCallback(
    (product: ApiProduct) => {
      setItems((prev) => [product, ...prev]);
      showToast('تم إنشاء المنتج بنجاح');
    },
    [showToast]
  );

  const handleUpdated = useCallback(
    (product: ApiProduct) => {
      setItems((prev) => prev.map((p) => (p.id === product.id ? product : p)));
      showToast('تم تحديث المنتج بنجاح');
    },
    [showToast]
  );

  const handleDelete = useCallback(
    (product: ApiProduct) => {
      if (!confirm(`هل أنت متأكد من حذف «${product.name}»؟`)) return;
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      showToast('تم حذف المنتج بنجاح');
    },
    [showToast]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-2xl text-[#0f2f52]">المنتجات</h1>
          <p className="text-sm font-bold text-gray-500">
            {items.length > 0 ? `${items.length} منتج في المخزون` : 'إدارة مخزون المنتجات'}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          
          <button
            onClick={openCreate}
            className="flex-1 sm:flex-none bg-[#0f2f52] hover:bg-[#1565c0] text-white font-black px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={18} /> إنشاء منتج جديد
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث المنتجات..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-gray-100 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#2f9de4]"
            />
          </div>
        </div>

        {items.length === 0 ? (
          <ProductsEmpty onCreate={openCreate} />
        ) : filtered.length === 0 ? (
          <ProductsEmpty query={searchTerm} onClearSearch={() => setSearchTerm('')} />
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['المنتج', 'الرابط', 'السنة', 'السعر', 'المخزون', 'الحالة', 'الإجراءات'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paged.map((product) => {
                  const image = primaryImage(product);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={image}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => handleImageError(e, product.team)}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                          />
                          <div>
                            <div className="font-black text-sm text-[#0f2f52]">{product.name}</div>
                            <div className="text-xs font-bold text-gray-500">{product.team}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600" dir="ltr">
                        {product.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">
                        {product.year || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                            product.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {product.is_active ? 'نشط' : 'معطّل'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                            aria-label={`تعديل ${product.name}`}
                          >
                            <Pencil size={17} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-all"
                            aria-label={`حذف ${product.name}`}
                          >
                            <Trash2 size={17} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-500">
              عرض {rangeStart}–{rangeEnd} من {filtered.length} منتج
            </p>
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </div>
          </>
        )}
      </div>

      {formOpen && (
        <Suspense fallback={null}>
          <ProductFormModal
            product={editing}
            onClose={closeForm}
            onCreated={handleCreated}
            onUpdated={handleUpdated}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  return (
    <div className="space-y-6">
      {toast && (
        <div
          role="status"
          className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 font-black text-sm px-4 py-3 rounded-xl"
        >
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      <ErrorBoundary
        onReset={resetAdminProducts}
        fallback={(error, reset) => (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <ProductsError error={error} onRetry={reset} />
          </div>
        )}
      >
        <Suspense fallback={<ProductsPageSkeleton />}>
          <ProductsManager showToast={showToast} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
