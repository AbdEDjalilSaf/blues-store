import { CreditCard, Instagram, MapPin, Phone, Facebook } from 'lucide-react';
import Logo from './Logo';

const SHOP_LINKS = [
  ['المتجر الكامل', '#shop'],
  ['حقبة الستينات', '#shop'],
  ['حقبة السبعينات', '#shop'],
  ['حقبة الثمانينات', '#shop'],
  ['حقبة التسعينات', '#shop'],
] as const;

const HELP_LINKS = [
  ['دليل المقاسات', '#shop'],
  ['شهادة الأصالة', '#auth'],
  ['قصتنا', '#story'], 
] as const;

const SOCIALS = [
  { Icon: Instagram, label: 'إنستغرام', url: 'https://www.instagram.com/bluescity01' },
  { Icon: Facebook, label: 'فيسبوك', url: 'https://web.facebook.com/profile.php?id=61590657809778' },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a2140] text-[#f5f9fe] pt-12 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <Logo className="w-10 h-10" />
            <span>
              <span className="block font-black text-lg">بلوز سيتي</span>
              <span className="block text-[10px] font-bold tracking-[.25em] text-[#bfe1f8]">BLUES CITY</span>
            </span>
          </div>
          <p className="text-[13px] font-medium text-[#f5f9fe]/60 leading-7 mb-4">
            وجهة جامعي الأقمصة الفينتاج في الوطن العربي.
          </p>
          <ul className="flex gap-2">
            {SOCIALS.map(({ Icon, label, url }) => (
              <li key={label}>
                <a
                  href={url}
                  aria-label={label}
                  rel="noopener"
                  className="w-10 h-10 grid place-items-center rounded-full bg-white/8 hover:bg-[#2f9de4] hover:text-[#0f2f52] transition-all"
                >
                  <Icon size={18} />
                </a>
              </li>
            ))}
            <a
                  href="https://www.tiktok.com/@bluescity01"
                  aria-label="TikTok"
                  rel="noopener"
                  className="w-10 h-10 grid place-items-center rounded-full bg-white/8 hover:bg-[#2f9de4] hover:text-[#0f2f52] transition-all"
                >
            <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="none" className='w-5 h-5'>
            <path d="M16.8218 5.1344C16.0887 4.29394 15.648 3.19805 15.648 2H14.7293C14.9659 3.3095 15.7454 4.43326 16.8218 5.1344Z" fill="#ffffff"/>
            <path d="M8.3218 11.9048C6.73038 11.9048 5.43591 13.2004 5.43591 14.7931C5.43591 15.903 6.06691 16.8688 6.98556 17.3517C6.64223 16.8781 6.43808 16.2977 6.43808 15.6661C6.43808 14.0734 7.73255 12.7778 9.324 12.7778C9.62093 12.7778 9.90856 12.8288 10.1777 12.9124V9.40192C9.89927 9.36473 9.61628 9.34149 9.324 9.34149C9.27294 9.34149 9.22654 9.34614 9.1755 9.34614V12.0394C8.90176 11.9558 8.61873 11.9048 8.3218 11.9048Z" fill="#ffffff"/>
            <path d="M19.4245 6.67608V9.34614C17.6429 9.34614 15.9912 8.77501 14.6456 7.80911V14.7977C14.6456 18.2851 11.8108 21.127 8.32172 21.127C6.97621 21.127 5.7235 20.6998 4.69812 19.98C5.8534 21.2198 7.50049 22 9.32392 22C12.8083 22 15.6478 19.1627 15.6478 15.6707V8.68211C16.9933 9.64801 18.645 10.2191 20.4267 10.2191V6.78293C20.0787 6.78293 19.7446 6.74574 19.4245 6.67608Z" fill="#ffffff"/>
            <path d="M14.6456 14.7977V7.80911C15.9912 8.77501 17.6429 9.34614 19.4245 9.34614V6.67608C18.3945 6.45788 17.4899 5.90063 16.8218 5.1344C15.7454 4.43326 14.9704 3.3095 14.7245 2H12.2098L12.2051 15.7775C12.1495 17.3192 10.8782 18.5591 9.32393 18.5591C8.35884 18.5591 7.50977 18.0808 6.98085 17.3564C6.06219 16.8688 5.4312 15.9076 5.4312 14.7977C5.4312 13.205 6.72567 11.9094 8.31708 11.9094C8.61402 11.9094 8.90168 11.9605 9.17079 12.0441V9.35079C5.75598 9.42509 3 12.2298 3 15.6707C3 17.3331 3.64492 18.847 4.69812 19.98C5.7235 20.6998 6.97621 21.127 8.32172 21.127C11.8061 21.127 14.6456 18.2851 14.6456 14.7977Z" fill="#ffffff"/>
            </svg>
            </a>
          </ul>
        </div>

        <nav aria-labelledby="footer-shop">
          <h2 id="footer-shop" className="font-black mb-4 text-[#bfe1f8]">تسوّق</h2>
          <ul className="space-y-2.5 text-[14px] font-bold text-[#f5f9fe]/70">
            {SHOP_LINKS.map(([t, h]) => (
              <li key={t}><a href={h} className="hover:text-[#bfe1f8]">{t}</a></li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-help">
          <h2 id="footer-help" className="font-black mb-4 text-[#bfe1f8]">مساعدة</h2>
          <ul className="space-y-2.5 text-[14px] font-bold text-[#f5f9fe]/70">
            {HELP_LINKS.map(([t, h]) => (
              <li key={t}><a href={h} className="hover:text-[#bfe1f8]">{t}</a></li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-black mb-4 text-[#bfe1f8]">تواصل</h2>
          <ul className="space-y-3 text-[14px] font-bold text-[#f5f9fe]/70">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-[#bfe1f8] shrink-0" />
              <a href="tel:+966551234567" dir="ltr">+966 55 123 4567</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-[#bfe1f8] shrink-0" /> الجزائر • نشحن لكل الولايات
            </li>
            <li className="flex items-center gap-2">
              <CreditCard size={16} className="text-[#bfe1f8] shrink-0" />  الدفع عند الاستلام
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] font-bold text-[#f5f9fe]/40">
        <span>© {year} بلوز سيتي — جميع الحقوق محفوظة</span>
        <span>صُنع بشغف لكرة القدم الجميلة</span>
      </div>
    </footer>
  );
}