import { useMemo, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { store } from '@/lib/store';
import { fmt } from '@/lib/fmt';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Users, Package, Wallet, CheckCircle, Filter } from 'lucide-react';
import { toast } from 'sonner';


import logo from '@/assets/logo_peaoge_sem_fundo.png';
import saiaXadrez from '@/assets/photos/saia_xadrez_edit.png';
import flatlay2 from '@/assets/photos/flatlay2_edit.png';
import shortsJeans from '@/assets/photos/shorts_jeans_edit.png';
import looksCabide from '@/assets/photos/looks_cabide_edit.png';
import camisetasRosa from '@/assets/photos/camisetas_rosa_edit.png';
import flatlayPlan from '@/assets/photos/flatlay_edited.jpg';


const photoStrip = [
  { src: saiaXadrez, label: 'DASHBOARD', path: '/' },
  { src: flatlay2, label: 'CATÁLOGO', path: '/catalogo' },
  { src: shortsJeans, label: 'VENDAS', path: '/vendas' },
  { src: looksCabide, label: 'FORNECEDORAS', path: '/fornecedoras' },
  { src: flatlayPlan, label: 'PLANEJAMENTO', path: '/planejamento' },
  { src: camisetasRosa, label: 'CONFIGURAÇÕES', path: '/configuracoes' },
];


const topBarColors = ['#2d4a2e', '#e8527a', '#f0a500', '#3ab5a0', '#9b59b6', '#7b61ff'];
const iconBgs = ['bg-primary/10 text-primary', 'bg-accent/10 text-accent', 'bg-[#f0a500]/10 text-[#f0a500]', 'bg-[#3ab5a0]/10 text-[#3ab5a0]', 'bg-[#7b61ff]/10 text-[#7b61ff]'];


export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setTick] = useState(0);
  const [userName, setUserName] = useState('Peaogê');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? '';
      const name = email.split('@')[0];
      if (name) setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    });
  }, []);
