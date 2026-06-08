import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const SHARED_PASSWORD = 'peaoge123';

const socias = [
  { name: 'Nicolle', email: 'nicolle@peaoge.com', cargo: 'Sócia', color: '#e8527a' },
  { name: 'Larissa', email: 'larissa@peaoge.com', cargo: 'Sócia', color: '#4a7a4b' },
  { name: 'Joice', email: 'joice@peaoge.com', cargo: 'Sócia', color: '#2d4a2e' },
];

export default function Login() {
  const navigate = useNavigate();
  const [loadingFor, setLoadingFor] = useState<number | null>(null);

  const handleEnter = async (i: number) => {
    if (loadingFor !== null) return;
    const socia = socias[i];
    setLoadingFor(i);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: socia.email,
        password: SHARED_PASSWORD,
      });
      if (error) {
        const msg = (error.message || '').toLowerCase();
        const code = (error as any).code as string | undefined;
        if (code === 'invalid_credentials' || msg.includes('invalid login')) {
          toast.error(`Conta de ${socia.name} ainda não configurada. Avise quem cuida do sistema.`);
        } else if (code === 'over_request_rate_limit' || (error as any).status === 429) {
          toast.error('Muitas tentativas. Aguarde 1 minuto.');
        } else {
          toast.error(error.message || 'Erro ao entrar.');
        }
        return;
      }
      navigate('/');
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('failed to fetch') || msg.includes('network')) {
        toast.error('Sem conexão. Verifique sua internet.');
      } else {
        toast.error(err?.message || 'Erro ao entrar.');
      }
    } finally {
      setLoadingFor(null);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — dark green with photo collage */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 opacity-35">
          {photos.map((src, i) => (
            <img key={i} src={src} alt="" className="w-full h-full object-cover" />
          ))}
        </div>

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

      {/* Right side — cream form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex justify-center mb-4">
            <img src={logo} alt="Peaogê" className="h-16" style={{ transform: 'rotate(-3deg)' }} />
          </div>

          <div>
            <h2 className="font-display text-4xl text-primary tracking-wide">ENTRAR</h2>
            <p className="text-xs text-muted-foreground mt-1">Toque no seu perfil para entrar</p>
          </div>

          <div className="space-y-3">
            {socias.map((s, i) => {
              const isLoading = loadingFor === i;
              const isDisabled = loadingFor !== null && !isLoading;
              return (
                <button
                  key={s.name}
                  onClick={() => handleEnter(i)}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    isLoading
                      ? 'border-accent bg-card'
                      : 'border-transparent bg-card/60 hover:bg-card hover:border-accent/40 active:scale-[0.98]'
                  } ${isDisabled ? 'opacity-50' : ''}`}
                >
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold font-display text-xl shrink-0"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg text-primary tracking-wide">{s.name.toUpperCase()}</p>
                    <p className="text-[10px] text-muted-foreground">{s.cargo}</p>
                  </div>
                  <span className="text-xs font-bold tracking-widest text-muted-foreground">
                    {isLoading ? '...' : '→'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
