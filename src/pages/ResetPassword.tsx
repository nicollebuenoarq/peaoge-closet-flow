import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo_peaoge_sem_fundo.png';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [loading, setLoading] = useState(false);

  // Supabase auto-processa o token de recovery no hash da URL e dispara
  // um evento PASSWORD_RECOVERY. Antes disso não devemos permitir o update.
  useEffect(() => {
    // Se já existir uma sessão de recovery (ex: usuário recém-clicou no link), liberar
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSave = async () => {
    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirma) {
      toast.error('As senhas não conferem.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      toast.success('Senha atualizada com sucesso! Faça login novamente.');
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err: any) {
      toast.error('Erro ao atualizar senha: ' + (err?.message ?? 'desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Peaogê" className="h-16" style={{ transform: 'rotate(-3deg)' }} />
        </div>

        <div>
          <h2 className="font-display text-4xl text-primary tracking-wide">NOVA SENHA</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {ready
              ? 'Defina sua nova senha de acesso.'
              : 'Validando link de recuperação...'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Nova senha</Label>
            <Input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={!ready || loading}
              className="mt-1.5 rounded-xl bg-card border-border"
              placeholder="••••••"
            />
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Confirmar senha</Label>
            <Input
              type="password"
              value={confirma}
              onChange={(e) => setConfirma(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              disabled={!ready || loading}
              className="mt-1.5 rounded-xl bg-card border-border"
              placeholder="••••••"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!ready || loading}
          className="w-full rounded-full text-xs font-bold tracking-widest h-12 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? 'SALVANDO...' : 'SALVAR NOVA SENHA →'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
}
