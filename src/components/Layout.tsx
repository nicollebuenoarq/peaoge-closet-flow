import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Receipt, Users, Settings, Menu, X, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.webp';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Catálogo', path: '/catalogo', icon: ShoppingBag },
  { label: 'Vendas', path: '/vendas', icon: Receipt },
  { label: 'Fornecedoras', path: '/fornecedoras', icon: Users },
  { label: 'Configurações', path: '/configuracoes', icon: Settings },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatDate() {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const nav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const currentPage = navItems.find(i => i.path === location.pathname);

  const SidebarContent = () => (
    <div className="flex flex-col h-full gradient-sidebar text-sidebar-foreground">
      {/* Logo area */}
      <div className="p-5 flex items-center justify-center">
        {(sidebarOpen || mobileOpen) ? (
          <div className="relative">
            <div className="absolute inset-0 bg-sidebar-ring/10 rounded-xl blur-xl" />
            <img src={logo} alt="Brechó Peaogê" className="relative h-16 w-auto object-contain rounded-xl bg-background/10 p-2" />
          </div>
        ) : (
          <img src={logo} alt="Brechó Peaogê" className="h-9 w-9 object-cover rounded-lg" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => nav(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-lg shadow-sidebar-accent/20'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-sidebar-ring" />
              )}
              <item.icon className={cn(
                'h-5 w-5 shrink-0 transition-transform duration-200',
                !active && 'group-hover:scale-110'
              )} />
              {(sidebarOpen || mobileOpen) && (
                <span className="transition-colors duration-200">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mx-3 mb-3 rounded-xl bg-sidebar-accent/30 border border-sidebar-border/30">
        {(sidebarOpen || mobileOpen) && (
          <p className="text-xs text-sidebar-foreground/40 text-center">
            Brechó Peaogê • v1.0
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col shrink-0 transition-all duration-300 shadow-xl',
        sidebarOpen ? 'w-60' : 'w-16'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 z-50 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center px-6 gap-4 shrink-0 shadow-sm">
          <button
            onClick={() => {
              if (window.innerWidth < 768) setMobileOpen(!mobileOpen);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="relative w-5 h-5">
              <Menu className={cn(
                'h-5 w-5 absolute transition-all duration-300',
                mobileOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
              )} />
              <X className={cn(
                'h-5 w-5 absolute transition-all duration-300',
                mobileOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
              )} />
            </div>
          </button>

          <div className="flex-1">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {currentPage?.label || 'Brechó Peaogê'}
            </h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {getGreeting()}, Peaogê 👋
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="capitalize">{formatDate()}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
