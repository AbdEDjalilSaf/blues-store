import { useState, type FormEvent } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

const ADMIN_EMAIL = 'noodsaf01@gmail.com';
const ADMIN_PASSWORD = 'nood saf 2003';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setError('');
      setLoggedIn(true);
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a2140] text-[#f5f9fe] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <a
          href="#home"
          className="inline-flex items-center gap-1.5 font-black text-sm text-[#bfe1f8] hover:text-[#2f9de4] transition-colors mb-6"
        >
          <ArrowRight size={16} /> العودة إلى المتجر
        </a>

        <div className="bg-[#0f2f52] border-2 border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-6">
            <Logo className="w-10 h-10" />
            <span>
              <span className="block font-black text-lg">دخول الإدارة</span>
              <span className="block text-[10px] font-bold tracking-[.25em] text-[#bfe1f8]">ADMIN PANEL</span>
            </span>
          </div>

          {loggedIn ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto grid place-items-center rounded-full bg-[#2f9de4]/15 text-[#2f9de4] mb-4">
                <ShieldCheck size={28} />
              </div>
              <h1 className="font-black text-xl mb-2">مرحباً بك في لوحة الإدارة</h1>
              <p className="text-[14px] font-medium text-[#f5f9fe]/60 mb-6">
                تم تسجيل الدخول بنجاح إلى {ADMIN_EMAIL}
              </p>
              <a
                href="#home"
                className="inline-flex items-center gap-1.5 bg-[#2f9de4] text-[#0f2f52] font-black text-sm px-6 py-3 rounded-full hover:bg-[#bfe1f8] transition-colors"
              >
                <ArrowRight size={16} /> العودة إلى المتجر
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="admin-email" className="block font-bold text-[13px] text-[#bfe1f8] mb-1.5">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute top-1/2 -translate-y-1/2 start-4 text-[#f5f9fe]/40" />
                  <input
                    id="admin-email"
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-[#0a2140] border-2 border-white/10 rounded-full ps-11 pe-4 py-3 text-[14px] font-bold outline-none focus:border-[#2f9de4] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="block font-bold text-[13px] text-[#bfe1f8] mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute top-1/2 -translate-y-1/2 start-4 text-[#f5f9fe]/40" />
                  <input
                    id="admin-password"
                    type="password"
                    dir="ltr"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a2140] border-2 border-white/10 rounded-full ps-11 pe-4 py-3 text-[14px] font-bold outline-none focus:border-[#2f9de4] transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-[13px] font-black text-[#ff8a8a] text-center">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-[#2f9de4] text-[#0f2f52] font-black text-[15px] py-3 rounded-full hover:bg-[#bfe1f8] transition-colors"
              >
                تسجيل الدخول
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
