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
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const nav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const currentPage = navItems.find(i => i.path === location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-card border-b" style={{ boxShadow: 'var(--shadow-nav)' }}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          {/* Top row: Logo + Nav */}
          <div className="flex items-center h-20 gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <img
                src={logo}
                alt="Brechó Peaogê"
                className="h-14 w-auto object-contain logo-blend"
              />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => nav(item.path)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                      active
                        ? 'bg-accent text-accent-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Date pill */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground bg-muted px-4 py-2 rounded-full shrink-0">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="capitalize">{formatDate()}</span>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden ml-auto p-2 rounded-xl hover:bg-muted transition-colors"
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
          </div>
        </div>

        {/* Mobile dropdown nav */}
        <div className={cn(
          'md:hidden overflow-hidden transition-all duration-300 border-t',
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-transparent'
        )}>
          <nav className="px-4 py-3 space-y-1 bg-card">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => nav(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page header with greeting */}
      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 pt-8 pb-2">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">
              {currentPage?.label || 'Brechó Peaogê'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {getGreeting()}, Peaogê 👋
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Brechó Peaogê • v1.0</p>
          <img src={logo} alt="" className="h-6 w-auto opacity-30 logo-blend" />
        </div>
      </footer>
    </div>
  );
}
