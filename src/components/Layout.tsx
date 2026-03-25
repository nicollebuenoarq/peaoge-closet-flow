import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Receipt, Users, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Catálogo', path: '/catalogo', icon: ShoppingBag },
  { label: 'Vendas', path: '/vendas', icon: Receipt },
  { label: 'Fornecedoras', path: '/fornecedoras', icon: Users },
  { label: 'Configurações', path: '/configuracoes', icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const nav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪝</span>
          {(sidebarOpen || mobileOpen) && (
            <h1 className="font-heading text-xl font-bold tracking-tight text-sidebar-primary">
              Brechó Peaogê
            </h1>
          )}
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => nav(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {(sidebarOpen || mobileOpen) && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        {(sidebarOpen || mobileOpen) && (
          <p className="text-xs text-sidebar-foreground/50">Sistema interno • v1.0</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col shrink-0 transition-all duration-300',
        sidebarOpen ? 'w-60' : 'w-16'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b bg-card flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => {
              if (window.innerWidth < 768) setMobileOpen(!mobileOpen);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="p-1.5 rounded-md hover:bg-muted"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h2 className="font-heading text-lg font-semibold">
            {navItems.find(i => i.path === location.pathname)?.label || 'Brechó Peaogê'}
          </h2>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
