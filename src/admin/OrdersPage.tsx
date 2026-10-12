export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black text-2xl text-[#0f2f52]">الطلبات</h1>
        <p className="text-sm font-bold text-gray-500">إدارة طلبات العملاء</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-sm font-bold text-gray-500 text-center py-8">
          لا يوجد طلبات بعد
        </div>
      </div>
    </div>
  );
}
