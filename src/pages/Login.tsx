import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import logo from '@/assets/logo_peaoge_sem_fundo.png';
import saiaXadrez from '@/assets/photos/saia_xadrez_edit.png';
import flatlay2 from '@/assets/photos/flatlay2_edit.png';
import shortsJeans from '@/assets/photos/shorts_jeans_edit.png';
import looksCabide from '@/assets/photos/looks_cabide_edit.png';
import camisetasRosa from '@/assets/photos/camisetas_rosa_edit.png';
import flatlayEdit from '@/assets/photos/flatlay_edit.png';

const photos = [saiaXadrez, flatlay2, shortsJeans, looksCabide, camisetasRosa, flatlayEdit];

const sociaDefaults: Record<string, string> = {
  Nicolle: 'nicolle123',
  Larissa: 'larissa123',
  Joice: 'joice123',
};

const socias = [
  { name: 'Nicolle', cargo: 'Sócia', color: '#e8527a' },
  { name: 'Larissa', cargo: 'Sócia', color: '#4a7a4b' },
  { name: 'Joice', cargo: 'Sócia', color: '#2d4a2e' },
];

function getSenha(name: string): string {
  const custom = localStorage.getItem(`brecho_senha_${name}`);
  return custom || sociaDefaults[name] || '';
}

export default function Login() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    if (selected === null) return;
    const socia = socias[selected];
    if (senha !== socia.senha) {
      toast.error('Senha incorreta. Tente novamente.');
      return;
    }
    localStorage.setItem('brecho_user_name', socia.name);
    localStorage.setItem('brecho_user_color', socia.color);
    navigate('/');
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
            disabled={selected === null}
            className="w-full rounded-full text-xs font-bold tracking-widest h-12 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            ENTRAR →
          </Button>
        </div>
      </div>
    </div>
  );
}
