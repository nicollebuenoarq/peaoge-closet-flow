import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseStore } from '@/lib/supabaseStore';
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

    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? '';
      const name = email.split('@')[0];
      const userName = name.charAt(0).toUpperCase() + name.slice(1);

      supabaseStore.getLembretes().then((lembretes) => {
        const filtradas = lembretes.filter(
          l =>
            !l.concluido &&
            (l.responsavel.includes(userName as any) || l.responsavel.includes('Todas'))
        );
        if (filtradas.length > 0) {
          setPendentes(filtradas);
          setOpen(true);
        }
      });
    });
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('brecho_lembretes_dismissed', 'true');
    setOpen(false);
  };

  if (pendentes.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display tracking-wide text-primary">
            <Bell className="h-4 w-4 text-accent" />
            LEMBRETES PENDENTES
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {pendentes.map((l) => (
            <div key={l.id} className="p-3 rounded-xl bg-card border border-border">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm text-primary">{l.titulo}</p>
                <div className="flex gap-1 flex-wrap justify-end">
                  {l.responsavel.map((r) => (
                    <Badge key={r} variant="secondary" className="text-[10px]">
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>
              {l.descricao && (
                <p className="text-xs text-muted-foreground mt-1">{l.descricao}</p>
              )}
              {l.dataLimite && (
                <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                  <CalendarClock className="h-3 w-3" />
                  {l.dataLimite}
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleDismiss}
          variant="outline"
          className="w-full rounded-full text-xs font-bold tracking-widest"
        >
          OK, ENTENDI
        </Button>
      </DialogContent>
    </Dialog>
  );
}
