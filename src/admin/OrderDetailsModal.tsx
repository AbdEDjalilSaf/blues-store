import { useState } from 'react';
import { CheckCircle2, ChevronDown, Loader2, MapPin, Phone, PackageCheck, Truck, Trash2, X } from 'lucide-react';
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
  onCancel?: (order: AdminOrder) => void | Promise<void>;
  cancelling?: boolean;
  onConfirm?: (order: AdminOrder) => void | Promise<void>;
  confirming?: boolean;
  onShip?: (order: AdminOrder) => void | Promise<void>;
  shipping?: boolean;
  onDeliver?: (order: AdminOrder) => void | Promise<void>;
  delivering?: boolean;
  onStatusChange?: (order: AdminOrder, newStatus: OrderStatus) => void | Promise<void>;
  changingStatus?: boolean;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ar-DZ', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function OrderDetailsModal({ order, onClose, onCancel, cancelling = false, onConfirm, confirming = false, onShip, shipping = false, onDeliver, delivering = false, onStatusChange, changingStatus = false }: Props) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

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
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  disabled={changingStatus || !onStatusChange}
                  className={`inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-black w-full transition-all ${
                    ORDER_STATUS_BADGE_CLASSES[order.status]
                  } ${onStatusChange ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
                >
                  <span>{ORDER_STATUS_LABELS[order.status]}</span>
                  {onStatusChange && (
                    <ChevronDown size={14} className={showStatusDropdown ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  )}
                </button>
                {showStatusDropdown && onStatusChange && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 overflow-hidden">
                    {ORDER_STATUSES.filter((status) => status !== 'cancelled').map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setShowStatusDropdown(false);
                          onStatusChange(order, status);
                        }}
                        disabled={status === order.status || changingStatus}
                        className={`w-full text-right px-3 py-2 text-xs font-black transition-all ${
                          status === order.status
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {ORDER_STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

          {order.status !== 'cancelled' && (
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
              {order.status === 'pending' && onConfirm && (
                <button
                  onClick={() => onConfirm(order)}
                  disabled={confirming}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {confirming ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  تأكيد الطلب
                </button>
              )}
              {order.status === 'confirmed' && onShip && (
                <button
                  onClick={() => onShip(order)}
                  disabled={shipping}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {shipping ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />}
                  شحن الطلب
                </button>
              )}
              {order.status === 'shipped' && onDeliver && (
                <button
                  onClick={() => onDeliver(order)}
                  disabled={delivering}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-black px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {delivering ? <Loader2 size={18} className="animate-spin" /> : <PackageCheck size={18} />}
                  توصيل الطلب
                </button>
              )}
              {onCancel && (
                <button
                  onClick={() => onCancel(order)}
                  disabled={cancelling}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-black px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  إلغاء الطلب
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
