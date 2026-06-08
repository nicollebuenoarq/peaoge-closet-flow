import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo_peaoge_sem_fundo.png';
import saiaXadrez from '@/assets/photos/saia_xadrez_edit.png';
import flatlay2 from '@/assets/photos/flatlay2_edit.png';
import shortsJeans from '@/assets/photos/shorts_jeans_edit.png';
import looksCabide from '@/assets/photos/looks_cabide_edit.png';
import camisetasRosa from '@/assets/photos/camisetas_rosa_edit.png';
import flatlayEdit from '@/assets/photos/flatlay_edit.png';

const photos = [saiaXadrez, flatlay2, shortsJeans, looksCabide, camisetasRosa, flatlayEdit];

const socias = [
  { name: 'Nicolle', email: 'nicolle@peaoge.com', cargo: 'Sócia', color: '#e8527a' },
  { name: 'Larissa', email: 'larissa@peaoge.com', cargo: 'Sócia', color: '#4a7a4b' },
  { name: 'Joice', email: 'joice@peaoge.com', cargo: 'Sócia', color: '#2d4a2e' },
];

export default function Login() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async () => {
    if (selected === null) return;
    const socia = socias[selected];
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: socia.email,
        password: senha,
      });
      if (error) {
        const msg = (error.message || '').toLowerCase();
        const code = (error as any).code as string | undefined;
        if (code === 'invalid_credentials' || msg.includes('invalid login')) {
          toast.error('Senha incorreta. Tente novamente.');
        } else if (code === 'email_not_confirmed' || msg.includes('not confirmed')) {
          toast.error('Email ainda não confirmado.');
        } else if (code === 'over_request_rate_limit' || msg.includes('rate limit') || (error as any).status === 429) {
          toast.error('Muitas tentativas. Aguarde 1 minuto e tente de novo.');
        } else {
          toast.error(error.message || 'Erro ao fazer login.');
        }
        return;
      }
      navigate('/');
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('failed to fetch') || msg.includes('network')) {
        toast.error('Sem conexão. Verifique sua internet e tente novamente.');
      } else {
        toast.error(err?.message || 'Erro ao fazer login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (selected === null) {
      toast.error('Selecione seu perfil primeiro.');
      return;
    }
    const socia = socias[selected];
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(socia.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(`Email de recuperação enviado para ${socia.email}. Confira sua caixa de entrada.`);
    } catch (err: any) {
      toast.error('Não foi possível enviar o email: ' + (err?.message ?? 'erro desconhecido'));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — dark green with photo collage */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        {/* Photo grid 2x3 */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 opacity-35">
          {photos.map((src, i) => (
            <img key={i} src={src} alt="" className="w-full h-full object-cover" />
          ))}
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <img
            src={logo}
            alt="Peaogê"
            className="w-[200px] h-auto mb-8"
            style={{ filter: 'brightness(0) invert(1)', transform: 'rotate(-4deg)' }}
          />
          <h1 className="text-center">
            <span className="font-display text-6xl text-white tracking-[0.08em] block leading-none">BRECHÓ</span>
            <span className="font-serif-italic text-4xl text-accent block mt-1">Peaogê</span>
          </h1>
          <div
            className="mt-8 inline-flex items-center gap-1 px-4 py-2 rounded-full text-accent text-xs font-bold border border-accent/40 bg-accent/10"
            style={{ transform: 'rotate(-6deg)' }}
          >
            Moda Circular ✦
          </div>
        </div>
      </div>

      {/* Right side — cream login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-4">
            <img src={logo} alt="Peaogê" className="h-16" style={{ transform: 'rotate(-3deg)' }} />
          </div>

          <div>
            <h2 className="font-display text-4xl text-primary tracking-wide">ENTRAR</h2>
            <p className="text-xs text-muted-foreground mt-1">Selecione seu perfil</p>
          </div>

          {/* Partner selection cards */}
          <div className="space-y-3">
            {socias.map((s, i) => (
              <button
                key={s.name}
                onClick={() => { setSelected(i); setSenha(''); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  selected === i
                    ? 'border-accent bg-card'
                    : 'border-transparent bg-card/60 hover:bg-card'
                }`}
              >
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold font-display text-xl shrink-0"
                  style={{ backgroundColor: s.color }}
                >
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="font-display text-lg text-primary tracking-wide">{s.name.toUpperCase()}</p>
                  <p className="text-[10px] text-muted-foreground">{s.cargo}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Password */}
          <div>
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Senha</Label>
            <Input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="mt-1.5 rounded-xl bg-card border-border"
              placeholder="••••••"
            />
          </div>

          {/* Login button */}
          <Button
            onClick={handleLogin}
            disabled={selected === null || loading}
            className="w-full rounded-full text-xs font-bold tracking-widest h-12 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? 'ENTRANDO...' : 'ENTRAR →'}
          </Button>

          {/* Forgot password */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={selected === null || resetLoading}
              className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline transition-colors"
            >
              {resetLoading ? 'Enviando...' : 'Esqueci minha senha'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
    }
