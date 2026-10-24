import { useState } from 'react';
import { Check, Circle, Loader2, PackageCheck, Search } from 'lucide-react';
import { formatPrice } from '../lib/api';
import {
  TRACKING_STATUS_LABELS,
  TRACKING_STATUSES,
  trackOrder,
  type TrackedOrder,
  type TrackingStatus,
} from '../lib/orderTrackingApi';

// Filter out 'cancelled' from the timeline unless the order is actually cancelled
const getVisibleStatusSteps = (currentStatus: TrackingStatus) => {
  const allSteps = TRACKING_STATUSES.map((s) => TRACKING_STATUS_LABELS[s]);
  if (currentStatus === 'cancelled') {
    return allSteps; // Show all steps including cancelled if order is cancelled
  }
  return allSteps.filter((_, i) => TRACKING_STATUSES[i] !== 'cancelled');
};

export default function OrderTracker() {
  const [phone, setPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { setErr('أدخل رقم الجوال المستخدم في الطلب'); return; }
    if (!orderNumber.trim()) { setErr('أدخل رقم الطلب'); return; }

    setLoading(true);
    setErr('');
    setTrackedOrder(null);

    try {
      const order = await trackOrder({ phone: phone.trim(), order_number: orderNumber.trim() });
      setTrackedOrder(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذّر تتبع الطلب. حاول مرة أخرى.';
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="track" className="bg-gradient-to-b from-[#f5f9fe] to-white py-16 md:py-24 scroll-mt-20" aria-labelledby="track-heading">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 id="track-heading" className="font-black text-3xl md:text-4xl text-[#0f2f52] mb-3">تتبع طلبك</h2>
          <p className="text-[#0f2f52]/60 font-bold text-sm md:text-base max-w-2xl mx-auto">
            أدخل رقم جوالك ورقم الطلب لعرض حالة طلبك لحظة بلحظة
          </p>
        </div>

        <div className="bg-[#0f2f52] rounded-[32px] p-6 md:p-12 text-[#f5f9fe] relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#bfe1f8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2f9de4]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2f9de4]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-14 h-14 rounded-2xl bg-[#2f9de4] text-[#0f2f52] grid place-items-center shadow-lg">
                <PackageCheck size={28} />
              </span>
            </div>

            <form onSubmit={track} className="flex flex-col lg:flex-row gap-3 mb-4">
              <div className="flex-1 flex items-center gap-3 bg-white/10 border-2 border-white/15 focus-within:border-[#2f9de4] rounded-2xl px-5 py-4 transition-all">
                <Search size={20} className="text-[#bfe1f8] shrink-0" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الجوال (0551234567)"
                  inputMode="tel"
                  dir="ltr"
                  className="flex-1 bg-transparent outline-none font-bold text-lg text-left placeholder:text-white/40"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 bg-white/10 border-2 border-white/15 focus-within:border-[#2f9de4] rounded-2xl px-5 py-4 transition-all">
                <Search size={20} className="text-[#bfe1f8] shrink-0" />
                <input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="رقم الطلب (BC-20261007-AB12)"
                  dir="ltr"
                  className="flex-1 bg-transparent outline-none font-bold text-lg text-left placeholder:text-white/40"
                />
              </div>
              <button disabled={loading} className="bg-[#2f9de4] hover:bg-[#bfe1f8] disabled:opacity-60 text-[#0f2f52] font-black text-lg px-10 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl">
                {loading ? <Loader2 size={20} className="animate-spin" /> : null} {loading ? 'جارٍ البحث…' : 'تتبع'}
              </button>
            </form>

            {err && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 text-sm font-black text-[#fecdd3] text-center">
                {err}
              </div>
            )}

            {trackedOrder && (
              <div className="mt-6">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <span className="font-black text-xl" dir="ltr">{trackedOrder.order_number}</span>
                    <span className="text-sm font-black bg-[#2f9de4] text-[#0f2f52] px-4 py-2 rounded-full">
                      {TRACKING_STATUS_LABELS[trackedOrder.status]}
                    </span>
                  </div>

                  <div className="relative mb-8" dir="ltr">
                    {/* Steps */}
                    <div className="relative flex justify-between">
                      {getVisibleStatusSteps(trackedOrder.status).map((label, i) => {
                        const visibleStatuses = getVisibleStatusSteps(trackedOrder.status);
                        const stepIndex = visibleStatuses.indexOf(TRACKING_STATUS_LABELS[trackedOrder.status]);
                        const isCompleted = i < stepIndex;
                        const isCurrent = i === stepIndex;
                        return (
                          <div key={label} className="flex flex-col items-center" style={{ width: `${100 / visibleStatuses.length}%` }}>
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ease-out relative z-10 ${
                                isCompleted
                                  ? 'bg-[#2f9de4] text-white scale-110 shadow-lg shadow-[#2f9de4]/30'
                                  : isCurrent
                                  ? 'bg-[#2f9de4] text-white animate-pulse shadow-lg shadow-[#2f9de4]/30'
                                  : 'bg-white/20 text-white/40'
                              }`}
                            >
                              {isCompleted ? (
                                <Check size={20} />
                              ) : (
                                <Circle size={20} strokeWidth={2} />
                              )}
                            </div>
                            <div
                              className={`text-xs font-black mt-3 text-center transition-all duration-500 ease-out max-w-[100px] ${
                                i <= stepIndex ? 'text-[#bfe1f8]' : 'text-white/40'
                              }`}
                            >
                              {label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Background line - positioned after circles to be behind them */}
                    <div className="absolute top-6 left-0 right-0 h-1 bg-white/20 rounded-full -z-10" />
                    {/* Progress line */}
                    <div
                      className="absolute top-6 left-0 h-1 bg-[#2f9de4] rounded-full transition-all duration-700 ease-out -z-10"
                      style={{
                        width: `${(getVisibleStatusSteps(trackedOrder.status).indexOf(TRACKING_STATUS_LABELS[trackedOrder.status]) / (getVisibleStatusSteps(trackedOrder.status).length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm font-bold text-white/70 mb-4">
                    <span>الإجمالي:</span>
                    <span className="text-white font-black text-lg" dir="ltr">{formatPrice(trackedOrder.total)}</span>
                  </div>

                  {trackedOrder.items.length > 0 && (
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-xs font-bold text-white/60 mb-3">المنتجات:</div>
                      <div className="space-y-2">
                        {trackedOrder.items.map((item) => (
                          <div key={item.id} className="text-sm font-bold text-white/80 flex justify-between items-center bg-white/5 rounded-lg px-4 py-2">
                            <span>{item.product_name}</span>
                            <span dir="ltr" className="text-[#bfe1f8]">{formatPrice(item.unit_price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
