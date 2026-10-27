import { X } from 'lucide-react';
import { formatPrice, resolveImageUrl, fallbackImage, type ApiProduct } from '../lib/api';

interface Props {
  product: ApiProduct | null;
  onClose: () => void;
}

export default function ProductDetailsModal({ product, onClose }: Props) {
  if (!product) return null;

  const images = product.images ?? [];
  const primary = images.find((img) => img.is_primary) || images[0];
  const primaryImage = images.length > 0
    ? (primary.url?.trim() || resolveImageUrl(primary.path))
    : fallbackImage(product.team);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="font-black text-xl text-[#0f2f52]">تفاصيل المنتج</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            aria-label="إغلاق"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                <img
                  src={primaryImage}
                  alt={product.name}
                  onError={(e) => { e.currentTarget.src = fallbackImage(product.team); }}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img) => (
                    <img
                      key={img.id}
                      src={img.url?.trim() || resolveImageUrl(img.path)}
                      alt=""
                      onError={(e) => { e.currentTarget.src = fallbackImage(product.team); }}
                      className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-black text-2xl text-[#0f2f52] mb-1">{product.name}</h3>
                <p className="text-sm font-bold text-gray-500">{product.team} • {product.year}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs font-bold text-gray-500 mb-1">السعر</div>
                  <div className="font-black text-lg text-[#0f2f52]">{formatPrice(product.price)}</div>
                  {product.old_price && (
                    <div className="text-sm font-bold text-gray-400 line-through">{formatPrice(product.old_price)}</div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs font-bold text-gray-500 mb-1">المخزون</div>
                  <div className="font-black text-lg text-[#0f2f52]">{product.stock}</div>
                  <div className="text-xs font-bold text-gray-500">
                    {product.stock > 0 ? 'متوفر' : 'نفدت الكمية'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-bold text-gray-500 mb-1">الوصف</div>
                <p className="text-sm font-medium text-gray-700">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">الرابط (slug)</div>
                  <div className="text-sm font-bold text-gray-700" dir="ltr">{product.slug}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">المقاسات</div>
                  <div className="text-sm font-bold text-gray-700">{product.size || 'غير محدد'}</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">الحالة</div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                    product.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {product.is_active ? 'نشط' : 'معطّل'}
                </span>
              </div>

              <div className="text-xs font-bold text-gray-400 pt-4 border-t border-gray-200">
                <div>معرّف: {product.id}</div>
                <div>آخر تحديث: {new Date(product.updated_at).toLocaleDateString('ar-DZ')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
