import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Receipt, Users, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo_peaoge_sem_fundo.png';

const navItems = [
  { label: 'DASHBOARD', path: '/', icon: LayoutDashboard },
  { label: 'CATÁLOGO', path: '/catalogo', icon: ShoppingBag },
  { label: 'VENDAS', path: '/vendas', icon: Receipt },
  { label: 'FORNECEDORAS', path: '/fornecedoras', icon: Users },
  { label: 'CONFIG', path: '/configuracoes', icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const nav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Get logged-in user from localStorage
  const userName = localStorage.getItem('brecho_user_name') || 'P';
  const userColor = localStorage.getItem('brecho_user_color') || '#e8527a';

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center h-16 gap-6">
            {/* Logo — rotated, no container */}
            <img
              src={logo}
              alt="Brechó Peaogê"
              className="h-[52px] w-auto object-contain cursor-pointer"
              style={{ transform: 'rotate(-3deg)' }}
              onClick={() => nav('/')}
            />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => nav(item.path)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-[0.1em] transition-all duration-200',
                      'font-mono',
                      active
                        ? 'bg-accent text-accent-foreground'
                        : 'text-primary hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User chip */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: userColor }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-mono font-bold text-primary">{userName}</span>
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
          <nav className="px-4 py-3 space-y-1 bg-background">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => nav(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold font-mono tracking-[0.1em] transition-all duration-200',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-primary hover:bg-muted'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-8 py-6">
        {children}
      </main>

      {/* Footer with watermark logo */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Brechó Peaogê • v2.0</p>
          <img
            src={logo}
            alt=""
            className="w-[80px] h-auto"
            style={{ transform: 'rotate(8deg)', opacity: 0.15 }}
          />
        </div>
      </footer>
    </div>
  );
}
