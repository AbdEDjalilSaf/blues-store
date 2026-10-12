import { useState } from 'react';
import { Bell, ChevronDown, LayoutDashboard, LogOut, Menu, Package, Search, Settings, Shirt, Users, X } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'orders', label: 'الطلبات', icon: Package },
  { id: 'products', label: 'المنتجات', icon: Shirt },
  { id: 'customers', label: 'العملاء', icon: Users },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

export default function AdminLayout({ children, currentPage, onPageChange, onLogout }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-[#0f2f52] text-white p-2 rounded-lg"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-40 h-full w-64 bg-[#0f2f52] text-white transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <h2 className="font-black text-xl mb-8">إدارة بلوز سيتي</h2>

          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  currentPage === item.id
                    ? 'bg-[#2f9de4] text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LogOut size={20} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:mr-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-4">
            <div className="w-full lg:w-auto lg:flex-1 max-w-md">
              <div className="relative">
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث..."
                  className="w-full bg-gray-100 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#2f9de4]"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-all">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-[#2f9de4] rounded-full flex items-center justify-center font-black text-white">
                  A
                </div>
                <ChevronDown size={18} className="text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
