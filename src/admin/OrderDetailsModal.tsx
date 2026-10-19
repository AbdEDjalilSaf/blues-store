import { useState } from 'react';
import { Loader2, MapPin, Phone, Save, X } from 'lucide-react';
import { formatPrice } from '../lib/api';
import {
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  type AdminOrder,
  type OrderStatus,
} from '../lib/ordersApi';

interface Props {
  order: AdminOrder;
  onClose: () => void;
  /**
   * Persist a new status. Resolves `true` on success — the page refreshes the
   * list behind the modal, while this modal flips to the new status instantly.
   */
  onStatusChange: (id: number, status: OrderStatus) => Promise<boolean>;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ar-DZ', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function OrderDetailsModal({ order, onClose, onStatusChange }: Props) {
  const [nextStatus, setNextStatus] = useState<OrderStatus>(order.status);
  const [saving, setSaving] = useState(false);

  const hasChanges = nextStatus !== order.status;

  const handleSave = async () => {
    if (!hasChanges || saving) return;
    setSaving(true);
    try {
      const ok = await onStatusChange(order.id, nextStatus);
      if (ok) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`تفاصيل الطلب ${order.order_number}`}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-black text-xl text-[#0f2f52]" dir="ltr">
              {order.order_number}
            </h2>
            <p className="text-xs font-bold text-gray-500">{formatDateTime(order.created_at)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            aria-label="إغلاق"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-gray-500">العميل</div>
              <div className="font-black text-[#0f2f52]">{order.customer_name || '—'}</div>
              {order.phone && (
                <a
                  href={`tel:${order.phone}`}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#1d6fd1] hover:underline"
                  dir="ltr"
                >
                  <Phone size={14} /> {order.phone}
                </a>
              )}
              {order.wilaya && (
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600">
                  <MapPin size={14} /> {order.wilaya}
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-gray-500">الحالة</div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                  ORDER_STATUS_BADGE_CLASSES[order.status]
                }`}
              >
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              <div className="text-xs font-bold text-gray-400 pt-1">
                عدد المنتجات: {order.items.length}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-black text-sm text-[#0f2f52] mb-3">المنتجات</h3>
            {order.items.length === 0 ? (
              <p className="text-sm font-bold text-gray-500 bg-gray-50 rounded-xl p-4">
                لا توجد تفاصيل منتجات لهذا الطلب.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-right text-xs font-black text-gray-500">المنتج</th>
                      <th className="px-4 py-2.5 text-left text-xs font-black text-gray-500">السعر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm font-bold text-[#0f2f52]">
                          {item.product_name || `منتج #${item.product_id}`}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-600 whitespace-nowrap text-left">
                          {formatPrice(item.unit_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm font-bold">
            <div className="flex items-center justify-between text-gray-600">
              <span>المجموع الفرعي</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>سعر التوصيل</span>
              <span>{order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : 'مجاني'}</span>
            </div>
            <div className="flex items-center justify-between text-[#0f2f52] font-black text-base pt-2 border-t border-gray-200">
              <span>الإجمالي</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div>
            <h3 className="font-black text-sm text-[#0f2f52] mb-3">سجل الطلب</h3>
            {order.timeline.length === 0 ? (
              <p className="text-sm font-bold text-gray-500">لا يوجد سجل متاح.</p>
            ) : (
              <ol className="space-y-3">
                {[...order.timeline].reverse().map((entry, index) => (
                  <li key={`${entry.status}-${entry.changed_at}-${index}`} className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        index === 0 ? 'bg-[#2f9de4]' : 'bg-gray-300'
                      }`}
                    />
                    <span className="font-black text-sm text-[#0f2f52]">
                      {ORDER_STATUS_LABELS[entry.status]}
                    </span>
                    <span className="text-xs font-bold text-gray-500 mr-auto">
                      {formatDateTime(entry.changed_at)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <label htmlFor="order-status" className="font-black text-sm text-[#0f2f52]">
              تغيير الحالة
            </label>
            <select
              id="order-status"
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
              disabled={saving}
              className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#2f9de4]"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`inline-flex items-center justify-center gap-2 font-black px-4 py-2.5 rounded-xl transition-all ${
                !hasChanges || saving
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#0f2f52] hover:bg-[#1565c0] text-white active:scale-95'
              }`}
            >
              {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              {saving ? 'جارٍ الحفظ…' : 'حفظ الحالة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
