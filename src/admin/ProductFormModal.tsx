import { useEffect, useMemo, useRef, useState, type FormEvent, type SyntheticEvent } from 'react';
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { createProduct, fallbackImage, resolveImageUrl, updateProduct, type ApiProduct } from '../lib/api';

interface Props {
  /** `null` creates a new product (POST); an existing row edits it locally. */
  product: ApiProduct | null;
  onClose: () => void;
  /** Fired after the API confirms creation (carries the server row). */
  onCreated: (product: ApiProduct) => void;
  /** Fired after a local edit (no update endpoint is exposed yet). */
  onUpdated: (product: ApiProduct) => void;
}

/** A product needs a small gallery, but the server caps uploads per request. */
const MIN_IMAGES = 2;
const MAX_IMAGES = 8;

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function discountFor(price: number, oldPrice: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/** Swap to a placeholder when a stored image file can't be loaded. */
function handleImageError(event: SyntheticEvent<HTMLImageElement>, team: string): void {
  const img = event.currentTarget;
  img.onerror = null;
  img.src = fallbackImage(team);
}

/** Create/edit form. Lazy-loaded (own chunk) so upload UI isn't in the page. */
export default function ProductFormModal({ product, onClose, onCreated, onUpdated }: Props) {
  const isNew = product === null;

  const [form, setForm] = useState(() => ({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    team: product?.team ?? '',
    year: product ? String(product.year) : '',
    description: product?.description ?? '',
    price: product ? String(product.price) : '',
    old_price: product?.old_price != null ? String(product.old_price) : '',
    stock: product ? String(product.stock) : '',
    size: product?.size ?? '',
    category_id: '',
    is_active: product ? product.is_active : true,
  }));
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Object URLs for the newly-picked files, revoked when they change/unmount.
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const addFiles = (picked: FileList | null) => {
    if (!picked?.length) return;
    setFiles((prev) => [...prev, ...Array.from(picked)].slice(0, MAX_IMAGES));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const validate = (): string | null => {
    if (!form.name.trim()) return 'الرجاء إدخال اسم المنتج.';
    if (!form.team.trim()) return 'الرجاء إدخال اسم الفريق.';
    const year = Number(form.year);
    if (!Number.isInteger(year) || year <= 0) return 'الرجاء إدخال سنة صحيحة.';
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) return 'الرجاء إدخال سعر صحيح أكبر من صفر.';
    const stock = Number(form.stock);
    if (!Number.isInteger(stock) || stock < 0) return 'الرجاء إدخال كمية مخزون صحيحة.';
    if (isNew && files.length < MIN_IMAGES) return 'الرجاء رفع صورتين على الأقل للمنتج.';
    if (files.length > MAX_IMAGES) return `لا يمكن رفع أكثر من ${MAX_IMAGES} صور.`;
    return null;
  };

  const resetForm = () => {
    setError('');
    setSuccess(false);
    setSubmitting(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }

    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);
    const oldPrice = form.old_price ? Number(form.old_price) : null;
    const categoryId = form.category_id ? Number(form.category_id) : null;
    const slug = form.slug.trim() || slugify(name);

    setError('');
    setSubmitting(true);

    try {
      if (isNew) {
        const created = await createProduct({
          name,
          slug,
          team: form.team.trim(),
          year: Number(form.year),
          description: form.description.trim(),
          price,
          old_price: oldPrice != null && Number.isFinite(oldPrice) ? oldPrice : null,
          stock,
          size: form.size.trim() || null,
          category_id: categoryId != null && Number.isFinite(categoryId) ? categoryId : null,
          is_active: form.is_active,
          images: files,
        });
        onCreated(created);
        setSuccess(true);
        setTimeout(() => onClose(), 1500);
      } else {
        const updated = await updateProduct(product!.id, {
          name,
          slug,
          team: form.team.trim(),
          year: Number(form.year),
          description: form.description.trim(),
          price,
          old_price: oldPrice != null && Number.isFinite(oldPrice) ? oldPrice : null,
          stock,
          size: form.size.trim() || null,
          category_id: categoryId != null && Number.isFinite(categoryId) ? categoryId : null,
          is_active: form.is_active,
          images: files.length > 0 ? files : undefined,
        });
        onUpdated(updated);
        setSuccess(true);
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'تعذّر حفظ المنتج. حاول مجدداً.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={submitting ? undefined : onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="font-black text-xl text-[#0f2f52]">
            {isNew ? 'إنشاء منتج جديد' : 'تعديل المنتج'}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-40"
            aria-label="إغلاق"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-black text-[#0f2f52] mb-1.5">
                الاسم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                disabled={submitting}
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4] disabled:opacity-60"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-black text-[#0f2f52] mb-1.5">الرابط (slug)</label>
              <input
                type="text"
                dir="ltr"
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                disabled={submitting}
                placeholder="nigeria-1994-home-shirt"
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4] disabled:opacity-60"
              />
              <p className="text-xs font-bold text-gray-400 mt-1">
                يُولَّد تلقائياً من الاسم إن تُرك فارغاً.
              </p>
            </div>

            <div>
              <label className="block text-sm font-black text-[#0f2f52] mb-1.5">
                الفريق <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.team}
                onChange={(e) => set('team', e.target.value)}
                disabled={submitting}
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4] disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-[#0f2f52] mb-1.5">
                السنة <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => set('year', e.target.value)}
                disabled={submitting}
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4] disabled:opacity-60"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-black text-[#0f2f52] mb-1.5">الوصف</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                disabled={submitting}
                rows={3}
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4] resize-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-[#0f2f52] mb-1.5">
                السعر (دج) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                disabled={submitting}
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4] disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-[#0f2f52] mb-1.5">السعر القديم</label>
              <input
                type="number"
                value={form.old_price}
                onChange={(e) => set('old_price', e.target.value)}
                disabled={submitting}
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4] disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-[#0f2f52] mb-1.5">
                المخزون <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                disabled={submitting}
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4] disabled:opacity-60"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-black text-[#0f2f52] mb-1.5">المقاسات</label>
              <input
                type="text"
                dir="ltr"
                value={form.size}
                onChange={(e) => set('size', e.target.value)}
                disabled={submitting}
                placeholder="S,M,L,XL"
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4] disabled:opacity-60"
              />
              <p className="text-xs font-bold text-gray-400 mt-1">
                مقاسات مفصولة بفواصل (مثال: S,M,L,XL). تُستخدم في صفحة المنتج.
              </p>
            </div>

            <div>
              <label className="block text-sm font-black text-[#0f2f52] mb-1.5">
                معرّف الفئة (اختياري)
              </label>
              <input
                type="number"
                value={form.category_id}
                onChange={(e) => set('category_id', e.target.value)}
                disabled={submitting}
                placeholder="category_id"
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4] disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-black text-[#0f2f52] mb-1.5">الصور</label>

              {!isNew && (product.images?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {(product.images ?? []).map((img) => (
                    <img
                      key={img.id}
                      src={resolveImageUrl(img.path)}
                      alt=""
                      onError={(e) => handleImageError(e, product.team)}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  ))}
                </div>
              )}

              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {previews.map((p, i) => (
                    <div key={p.url} className="relative">
                      <img
                        src={p.url}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        disabled={submitting}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 disabled:opacity-40"
                        aria-label="إزالة الصورة"
                      >
                        <X size={12} /> 
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => addFiles(e.target.files)}
                disabled={submitting}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting || files.length >= MAX_IMAGES}
                className="w-full bg-gray-100 hover:bg-gray-200 text-[#0f2f52] font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                <ImagePlus size={18} />
                {files.length > 0
                  ? `تم اختيار ${files.length} صورة`
                  : `رفع الصور (${MIN_IMAGES}–${MAX_IMAGES})`}
              </button>
              <p className="text-xs font-bold text-gray-400 mt-1">
                {isNew
                  ? `ارفع من ${MIN_IMAGES} إلى ${MAX_IMAGES} صور مع المنتج الجديد.`
                  : 'تُدار صور المنتجات الحالية من الخادم.'}
              </p>
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => set('is_active', e.target.checked)}
                  disabled={submitting}
                  className="w-5 h-5 accent-[#0f2f52] disabled:opacity-60"
                />
                <span className="text-sm font-black text-[#0f2f52]">نشط</span>
              </label>
            </div>
          </div>

          {success && (
            <div
              role="status"
              className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-4 py-3 rounded-xl"
            >
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{isNew ? 'تم إنشاء المنتج بنجاح!' : 'تم تحديث المنتج بنجاح!'}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-3 rounded-xl"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#0f2f52] font-black py-3 rounded-xl transition-all disabled:opacity-60"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#0f2f52] hover:bg-[#1565c0] text-white font-black py-3 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isNew ? 'جارٍ الإنشاء…' : 'جارٍ الحفظ…'}
                </>
              ) : (
                <>
                  <Upload size={17} />
                  {isNew ? 'إنشاء المنتج' : 'تحديث المنتج'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
