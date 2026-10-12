export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black text-2xl text-[#0f2f52]">لوحة التحكم</h1>
        <p className="text-sm font-bold text-gray-500">نظرة عامة على أداء متجرك</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="text-sm font-bold text-gray-500 mb-2">إجمالي المبيعات</div>
          <div className="font-black text-2xl text-[#0f2f52]">0 دج</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="text-sm font-bold text-gray-500 mb-2">إجمالي الطلبات</div>
          <div className="font-black text-2xl text-[#0f2f52]">0</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="text-sm font-bold text-gray-500 mb-2">إجمالي المنتجات</div>
          <div className="font-black text-2xl text-[#0f2f52]">12</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="text-sm font-bold text-gray-500 mb-2">العملاء</div>
          <div className="font-black text-2xl text-[#0f2f52]">0</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-black text-lg text-[#0f2f52] mb-4">النشاط الأخير</h2>
        <div className="text-sm font-bold text-gray-500 text-center py-8">
          لا يوجد نشاط حديث
        </div>
      </div>
    </div>
  );
}
