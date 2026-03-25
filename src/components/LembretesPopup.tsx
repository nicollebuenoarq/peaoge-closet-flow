import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    });
  }, []);


  const handleDismiss = () => {
    sessionStorage.setItem('brecho_lembretes_dismissed', 'true');
    setOpen(false);
  };


  if (pendentes.length === 0) return null;


  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
