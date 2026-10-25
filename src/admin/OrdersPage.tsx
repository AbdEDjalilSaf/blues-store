import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Eye, RefreshCw, Trash2,CircleX  } from 'lucide-react';
import { formatPrice } from '../lib/api';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  deleteAdminOrder,
  deliverAdminOrder,
  fetchAdminOrders,
  invalidateAdminOrdersCache,
  shipAdminOrder,
  updateAdminOrderStatus,
  type AdminOrder,
  type AdminOrdersPage,
  type OrderStatus,
} from '../lib/ordersApi';
import Pagination from './Pagination';
import { OrdersEmpty, OrdersError, OrdersTableSkeleton } from './OrdersStates';

/** The detail view (and its timeline UI) ships in its own chunk, opened on demand. */
const OrderDetailsModal = lazy(() => import('./OrderDetailsModal'));

const PAGE_SIZE = 8; // Smaller page size for faster API responses

/** Server-paginated tab bar: `null` = all orders, otherwise the status enum. */
const STATUS_TABS: { value: OrderStatus | null; label: string }[] = [
  { value: null, label: 'الكل' },
  ...ORDER_STATUSES.map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status] })),
];

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ar-DZ', { dateStyle: 'medium', timeStyle: 'short' });
}

interface ManagerProps {
  showToast: (message: string) => void;
}

/**
 * Data-bound view. Unlike Products (one fetch + client-side slicing), orders
 * are paginated and filtered *server-side*, so each tab/page change is a small
 * request. The module cache in `ordersApi` makes revisited pages instant, and
 * every superseded request is aborted so a slow response can't clobber the UI.
 */
function OrdersManager({ showToast }: ManagerProps) {
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AdminOrdersPage | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [viewing, setViewing] = useState<AdminOrder | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [shippingId, setShippingId] = useState<number | null>(null);
  const [deliveringId, setDeliveringId] = useState<number | null>(null);
  const [changingStatusId, setChangingStatusId] = useState<number | null>(null);

  /**
   * Identity of the query currently displayed. "Refreshing" is *derived*
   * (displayed query ≠ active query) rather than set inside the load call,
   * so the effect body never triggers a synchronous state update.
   */
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const activeKey = `${status ?? 'all'}|${page}|${refreshNonce}`;
  const isRefreshing = result !== null && loadedKey !== activeKey;

  /** Monotonic sequence — only the latest request may touch state. */
  const requestSeq = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(
    (nextStatus: OrderStatus | null, nextPage: number, nonce: number, force: boolean) => {
      const seq = ++requestSeq.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const key = `${nextStatus ?? 'all'}|${nextPage}|${nonce}`;

      fetchAdminOrders({
        status: nextStatus,
        page: nextPage,
        perPage: PAGE_SIZE,
        force,
        signal: controller.signal,
      })
        .then((res) => {
          if (seq !== requestSeq.current) return;
          setResult(res);
          setError(null);
          setLoadedKey(key);
          // Rows vanished (e.g. last row of the last page) — snap to a valid page.
          if (res.meta.currentPage !== nextPage) setPage(res.meta.currentPage);
        })
        .catch((err: unknown) => {
          if (seq !== requestSeq.current) return;
          // A cancelled request is intentional — never surface it.
          if (err instanceof DOMException && err.name === 'AbortError') return;
          setError(err);
          setLoadedKey(key);
        });
    },
    []
  );

  useEffect(() => {
    load(status, page, refreshNonce, false);
    return () => abortRef.current?.abort();
  }, [load, status, page, refreshNonce]);

  // Prefetch next page when not on the last page
  useEffect(() => {
    if (!result || result.meta.lastPage <= page) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchAdminOrders({
        status,
        page: page + 1,
        perPage: PAGE_SIZE,
        signal: controller.signal,
      }).catch(() => {
        /* prefetch is best-effort — ignore failures */
      });
    }, 1000); // Prefetch after 1 second
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [result, status, page]);

  const selectTab = useCallback((next: OrderStatus | null) => {
    setStatus(next);
    setPage(1);
  }, []);

  /** Retry/refresh: bust the memory cache and bump the nonce to re-run the effect. */
  const reload = useCallback(() => {
    invalidateAdminOrdersCache();
    setRefreshNonce((n) => n + 1);
  }, []);

  const cancelOrder = useCallback(
    async (order: AdminOrder) => {
      if (order.status === 'cancelled') return;
      if (!confirm(`هل أنت متأكد من إلغاء الطلب ${order.order_number}؟`)) return;

      setCancellingId(order.id);
      try {
        await updateAdminOrderStatus(order.id, 'cancelled');
        showToast('تم إلغاء الطلب بنجاح');
        invalidateAdminOrdersCache();
        setRefreshNonce((n) => n + 1);
        if (viewing?.id === order.id) {
          setViewing((current) => (current ? { ...current, status: 'cancelled' } : current));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'تعذّر إلغاء الطلب. حاول مرة أخرى.';
        showToast(message);
      } finally {
        setCancellingId(null);
      }
    },
    [showToast, viewing]
  );

  const deleteOrder = useCallback(
    async (order: AdminOrder) => {
      if (!confirm(`هل أنت متأكد من حذف الطلب ${order.order_number} نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`)) return;

      setDeletingId(order.id);
      try {
        await deleteAdminOrder(order.id);
        showToast('تم حذف الطلب بنجاح');
        invalidateAdminOrdersCache();
        setRefreshNonce((n) => n + 1);
        if (viewing?.id === order.id) {
          setViewing(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'تعذّر حذف الطلب. حاول مرة أخرى.';
        showToast(message);
      } finally {
        setDeletingId(null);
      }
    },
    [showToast, viewing]
  );

  const confirmOrder = useCallback(
    async (order: AdminOrder) => {
      if (order.status !== 'pending') return;
      if (!confirm(`هل أنت متأكد من تأكيد الطلب ${order.order_number}؟`)) return;

      setConfirmingId(order.id);
      try {
        await updateAdminOrderStatus(order.id, 'confirmed');
        showToast('تم تأكيد الطلب بنجاح');
        invalidateAdminOrdersCache();
        setRefreshNonce((n) => n + 1);
        if (viewing?.id === order.id) {
          setViewing((current) => (current ? { ...current, status: 'confirmed' } : current));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'تعذّر تأكيد الطلب. حاول مرة أخرى.';
        showToast(message);
      } finally {
        setConfirmingId(null);
      }
    },
    [showToast, viewing]
  );

  const handleStatusChange = useCallback(
    async (order: AdminOrder, newStatus: OrderStatus) => {
      if (order.status === newStatus) return;
      if (!confirm(`هل أنت متأكد من تغيير حالة الطلب ${order.order_number} إلى "${ORDER_STATUS_LABELS[newStatus]}"؟`)) return;

      setChangingStatusId(order.id);
      try {
        await updateAdminOrderStatus(order.id, newStatus);
        showToast(`تم تغيير حالة الطلب إلى "${ORDER_STATUS_LABELS[newStatus]}"`);
        invalidateAdminOrdersCache();
        setRefreshNonce((n) => n + 1);
        if (viewing?.id === order.id) {
          setViewing((current) => (current ? { ...current, status: newStatus } : current));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'تعذّر تغيير حالة الطلب. حاول مرة أخرى.';
        showToast(message);
      } finally {
        setChangingStatusId(null);
      }
    },
    [showToast, viewing]
  );

  const shipOrder = useCallback(
    async (order: AdminOrder) => {
      if (order.status !== 'confirmed') return;
      if (!confirm(`هل أنت متأكد من شحن الطلب ${order.order_number}؟`)) return;

      setShippingId(order.id);
      try {
        await shipAdminOrder(order.id);
        showToast('تم شحن الطلب بنجاح');
        invalidateAdminOrdersCache();
        setRefreshNonce((n) => n + 1);
        if (viewing?.id === order.id) {
          setViewing((current) => (current ? { ...current, status: 'shipped' } : current));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'تعذّر شحن الطلب. حاول مرة أخرى.';
        showToast(message);
      } finally {
        setShippingId(null);
      }
    },
    [showToast, viewing]
  );

  const deliverOrder = useCallback(
    async (order: AdminOrder) => {
      if (order.status !== 'shipped') return;
      if (!confirm(`هل أنت متأكد من توصيل الطلب ${order.order_number}؟`)) return;

      setDeliveringId(order.id);
      try {
        await deliverAdminOrder(order.id);
        showToast('تم توصيل الطلب بنجاح');
        invalidateAdminOrdersCache();
        setRefreshNonce((n) => n + 1);
        if (viewing?.id === order.id) {
          setViewing((current) => (current ? { ...current, status: 'delivered' } : current));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'تعذّر توصيل الطلب. حاول مرة أخرى.';
        showToast(message);
      } finally {
        setDeliveringId(null);
      }
    },
    [showToast, viewing]
  );


  const meta = result?.meta;
  const orders = result?.orders ?? [];
  const rangeStart = meta?.from ?? 0;
  const rangeEnd = meta?.to ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-2xl text-[#0f2f52]">الطلبات</h1>
          <p className="text-sm font-bold text-gray-500">
            {meta && meta.total > 0 ? `${meta.total} طلب من العملاء` : 'إدارة طلبات العملاء'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mb-1" role="tablist" aria-label="تصفية حسب الحالة">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <button
              key={tab.value ?? 'all'}
              role="tab"
              aria-selected={active}
              onClick={() => selectTab(tab.value)}
              className={`whitespace-nowrap font-black text-sm px-4 py-2 rounded-full transition-all ${
                active
                  ? 'bg-[#0f2f52] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {error !== null && result === null ? (
          <OrdersError error={error} onRetry={reload} />
        ) : result === null ? (
          <OrdersTableSkeleton />
        ) : orders.length === 0 ? (
          <OrdersEmpty filtered={status !== null} onClearFilter={() => selectTab(null)} />
        ) : (
          <div className={isRefreshing ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['رقم الطلب', 'العميل', 'الولاية', 'المجموع', 'الحالة', 'الإجراءات'].map((h) => (
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
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-black text-sm text-[#0f2f52]" dir="ltr">
                          {order.order_number}
                        </div>
                        <div className="text-xs font-bold text-gray-500">
                          {formatDateTime(order.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black text-sm text-[#0f2f52]">
                          {order.customer_name || '—'}
                        </div>
                        {order.phone && (
                          <a
                            href={`tel:${order.phone}`}
                            className="text-xs font-bold text-[#1d6fd1] hover:underline"
                            dir="ltr"
                          >
                            {order.phone}
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">
                        {order.wilaya || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-[#0f2f52]">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${
                            ORDER_STATUS_BADGE_CLASSES[order.status]
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewing(order)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-all"
                            aria-label={`عرض الطلب ${order.order_number}`}
                          >
                            <Eye size={17} className="text-[#1d6fd1]" />
                          </button>
                          {order.status !== 'cancelled' && (
                            <button
                              onClick={() => cancelOrder(order)}
                              disabled={cancellingId === order.id}
                              className="p-2 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label={`إلغاء الطلب ${order.order_number}`}
                              title="الغاء الطلب"
                            >
                              <CircleX size={17} className="text-red-600" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteOrder(order)}
                            disabled={deletingId === order.id}
                            className="p-2 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`حذف الطلب ${order.order_number}`}
                            title="حذف نهائي"
                          >
                            <Trash2 size={17} className="text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-200">
              <p className="text-xs font-bold text-gray-500">
                عرض {rangeStart}–{rangeEnd} من {meta?.total ?? 0} طلب
              </p>
              <Pagination
                page={meta?.currentPage ?? 1}
                totalPages={meta?.lastPage ?? 1}
                onPageChange={setPage}
              />
            </div>
          </div>
        )}
      </div>

      {viewing && (
        <Suspense fallback={null}>
          <OrderDetailsModal
            order={viewing}
            onClose={() => setViewing(null)}
            onCancel={cancelOrder}
            cancelling={cancellingId === viewing.id}
            onConfirm={confirmOrder}
            confirming={confirmingId === viewing.id}
            onShip={shipOrder}
            shipping={shippingId === viewing.id}
            onDeliver={deliverOrder}
            delivering={deliveringId === viewing.id}
            onStatusChange={handleStatusChange}
            changingStatus={changingStatusId === viewing.id}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function OrdersPage() {
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
        onReset={invalidateAdminOrdersCache}
        fallback={(error, reset) => (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <OrdersError error={error} onRetry={reset} />
          </div>
        )}
      >
        <OrdersManager showToast={showToast} />
      </ErrorBoundary>
    </div>
  );
}
