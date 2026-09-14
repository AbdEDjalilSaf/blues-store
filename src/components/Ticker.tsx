const ITEMS = ['أصلي 100% وموثّق', 'فحص  معتمد', 'شحن سريع',  'قطع نادرة مميزة '];

export default function Ticker() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="bg-[#2f9de4] border-y-4 border-[#0f2f52] overflow-hidden py-2.5" dir="ltr">
      <div className="flex gap-8 whitespace-nowrap animate-[marquee_22s_linear_infinite] w-max">
        {row.map((t, i) => (
          <span key={i} dir="rtl" className="flex items-center gap-2 font-black text-[#f5f9fe]/95 text-sm">
            <span className="w-2 h-2 rotate-45 bg-[#1565c0] inline-block" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}
