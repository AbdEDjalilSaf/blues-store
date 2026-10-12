export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black text-2xl text-[#0f2f52]">الإعدادات</h1>
        <p className="text-sm font-bold text-gray-500">تكوين إعدادات متجرك</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-black text-lg text-[#0f2f52] mb-4">إعدادات المتجر</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-black text-[#0f2f52] mb-1.5">اسم المتجر</label>
            <input
              type="text"
              defaultValue="Blues City"
              className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4]"
            />
          </div>
          <div>
            <label className="block text-sm font-black text-[#0f2f52] mb-1.5">بريد المتجر الإلكتروني</label>
            <input
              type="email"
              defaultValue="contact@bluescity.com"
              className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4]"
            />
          </div>
          <button className="bg-[#0f2f52] hover:bg-[#1565c0] text-white font-black px-6 py-2.5 rounded-xl transition-all">
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
}
