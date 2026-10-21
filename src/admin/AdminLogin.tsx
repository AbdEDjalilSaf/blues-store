import { useState } from 'react';
import { Lock, User } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials
    if (email === 'noodsaf01@gmail.com' && password === 'nood saf 2003') {
      localStorage.setItem('admin-auths', 'true');
      // Hand control back to AdminApp — no full reload, so the lazily
      // loaded admin chunks and the warm product cache survive login.
      onLogin();
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f9fe] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-black text-2xl text-[#0f2f52] mb-2">لوحة التحكم</h1>
          <p className="text-sm font-bold text-[#0f2f52]/60">تسجيل الدخول للمسؤول</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-black text-[13px] text-[#0f2f52] flex items-center gap-1.5 mb-1.5">
              <User size={15} /> البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@gmail.com"
              className="w-full bg-[#f5f9fe] border-2 border-[#0f2f52]/12 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-[#2f9de4]"
            />
          </div>

          <div>
            <label className="font-black text-[13px] text-[#0f2f52] flex items-center gap-1.5 mb-1.5">
              <Lock size={15} /> كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#f5f9fe] border-2 border-[#0f2f52]/12 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-[#2f9de4]"
            />
          </div>

          {error && (
            <div className="text-[12px] font-black text-[#1565c0] bg-[#1565c0]/10 rounded-xl p-3 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#0f2f52] hover:bg-[#1565c0] text-white font-black py-3 rounded-2xl transition-all"
          >
            تسجيل الدخول
          </button>
        </form>

        
      </div>
    </div>
  );
}
