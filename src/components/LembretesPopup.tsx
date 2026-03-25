import { useEffect, useState } from 'react';
import { store } from '@/lib/store';
import { Lembrete } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CalendarClock } from 'lucide-react';

export default function LembretesPopup() {
  const [open, setOpen] = useState(false);
  const [pendentes, setPendentes] = useState<Lembrete[]>([]);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('brecho_lembretes_dismissed');
    if (dismissed) return;

    const userName = localStorage.getItem('brecho_user_name') || '';
    const lembretes = store.getLembretes().filter(
      l => !l.concluido && (l.responsavel.includes(userName as any) || l.responsavel.includes('Todas'))
    );

    if (lembretes.length > 0) {
      setPendentes(lembretes);
      setOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('brecho_lembretes_dismissed', 'true');
    setOpen(false);
  };

  if (pendentes.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wide flex items-center gap-2 text-primary">
            <Bell className="h-5 w-5 text-accent" />
            LEMBRETES PENDENTES
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {pendentes.map(l => (
            <div key={l.id} className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display text-sm tracking-wide text-foreground">{l.titulo}</h4>
                {l.responsavel.map(r => (
                  <Badge key={r} variant="secondary" className="text-[10px] shrink-0">
                    {r}
                  </Badge>
                ))}
              </div>
              {l.descricao && (
                <p className="text-xs text-muted-foreground leading-relaxed">{l.descricao}</p>
              )}
              {l.dataLimite && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  <span>Até {new Date(l.dataLimite).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleDismiss}
          className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold tracking-wide"
        >
          ✓ Entendido
        </Button>
      </DialogContent>
    </Dialog>
  );
}
