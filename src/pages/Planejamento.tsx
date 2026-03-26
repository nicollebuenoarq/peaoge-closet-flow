import { useState, useEffect, useCallback } from 'react';
import { supabaseStore } from '@/lib/supabaseStore';
import type { Lembrete, DropPlan, Responsavel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, CalendarPlus, Plus, Trash2, CheckCircle, Edit2, Package } from 'lucide-react';
import { toast } from 'sonner';

const responsaveis: Responsavel[] = ['Nicolle', 'Larissa', 'Joice', 'Todas'];
const socias: Responsavel[] = ['Nicolle', 'Larissa', 'Joice'];

const responsavelColors: Record<string, string> = {
  Nicolle: 'bg-[#e8527a]/15 text-[#e8527a]',
  Larissa: 'bg-[#4a7a4b]/15 text-[#4a7a4b]',
  Joice: 'bg-primary/15 text-primary',
  Todas: 'bg-accent/15 text-accent',
};

export default function Planejamento() {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [dropPlans, setDropPlans] = useState<DropPlan[]>([]);
  const [pecas, setPecas] = useState<{ sku: number; drop: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroResp, setFiltroResp] = useState<string>('all');
  const [showLembrete, setShowLembrete] = useState(false);
  const [editLembrete, setEditLembrete] = useState<Lembrete | null>(null);
  const [showDrop, setShowDrop] = useState(false);
  const [editDrop, setEditDrop] = useState<DropPlan | null>(null);

  const [lTitulo, setLTitulo] = useState('');
  const [lDescricao, setLDescricao] = useState('');
  const [lDataLimite, setLDataLimite] = useState('');
  const [lResponsavel, setLResponsavel] = useState<Responsavel[]>(['Todas']);

  const [dDrop, setDDrop] = useState('');
  const [dData, setDData] = useState('');
  const [dPreco, setDPreco] = useState('');
  const [dMeta, setDMeta] = useState('');
  const [dObs, setDObs] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [lem, drops, pcs] = await Promise.all([
        supabaseStore.getLembretes(),
        supabaseStore.getDropPlans(),
        supabaseStore.getPecas(),
      ]);
      setLembretes(lem);
      setDropPlans(drops);
      setPecas(pcs);
    } catch (err) {
      console.error('[Planejamento] Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredLembretes = filtroResp === 'all'
    ? lembretes
    : lembretes.filter(l => l.responsavel.includes(filtroResp as Responsavel));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortByUrgency = (list: Lembrete[]) =>
    [...list].sort((a, b) => {
      const da = a.dataLimite ? new Date(a.dataLimite + 'T00:00:00') : null;
      const db = b.dataLimite ? new Date(b.dataLimite + 'T00:00:00') : null;
      const overA = da && da < today ? 1 : 0;
      const overB = db && db < today ? 1 : 0;
      if (overA !== overB) return overB - overA;
      if (da && db) return da.getTime() - db.getTime();
      if (da) return -1;
      if (db) return 1;
      return 0;
    });

  const pendentes = sortByUrgency(filteredLembretes.filter(l => !l.concluido));
  const concluidos = filteredLembretes.filter(l => l.concluido);

  const toggleResponsavel = (r: Responsavel) => {
    if (r === 'Todas') {
      setLResponsavel(['Todas']);
    } else {
      let next: Responsavel[] = lResponsavel.filter(x => x !== 'Todas');
      if (next.includes(r)) {
        next = next.filter(x => x !== r);
      } else {
        next = [...next, r];
      }
      if (next.length === 0) next = ['Todas'];
      if (next.length === 3 && socias.every(s => next.includes(s))) next = ['Todas'];
      setLResponsavel(next);
    }
  };

  const openNewLembrete = () => {
    setEditLembrete(null);
    setLTitulo(''); setLDescricao(''); setLDataLimite(''); setLResponsavel(['Todas']);
    setShowLembrete(true);
  };

  const openEditLembrete = (l: Lembrete) => {
    setEditLembrete(l);
    setLTitulo(l.titulo); setLDescricao(l.descricao);
    setLDataLimite(l.dataLimite || ''); setLResponsavel(l.responsavel);
    setShowLembrete(true);
  };

  const saveLembrete = async () => {
    if (!lTitulo.trim()) { toast.error('Título obrigatório'); return; }
    try {
      if (editLembrete) {
        await supabaseStore.upsertLembrete({ ...editLembrete, titulo: lTitulo, descricao: lDescricao, dataLimite: lDataLimite || null, responsavel: lResponsavel });
        toast.success('Lembrete atualizado');
      } else {
        const novo: Lembrete = {
          id: crypto.randomUUID(),
          titulo: lTitulo, descricao: lDescricao,
          dataLimite: lDataLimite || null, responsavel: lResponsavel,
          concluido: false, criadoEm: new Date().toISOString(),
        };
        await supabaseStore.upsertLembrete(novo);
        toast.success('Lembrete criado');
      }
      setShowLembrete(false);
      await loadData();
    } catch (err) { console.error(err); toast.error('Erro ao salvar lembrete'); }
  };

  const toggleConcluido = async (id: string) => {
    try {
      const l = lembretes.find(x => x.id === id);
      if (!l) return;
      await supabaseStore.upsertLembrete({ ...l, concluido: !l.concluido });
      await loadData();
    } catch (err) { console.error(err); }
  };

  const deleteLembrete = async (id: string) => {
    try {
      await supabaseStore.deleteLembrete(id);
      toast.success('Lembrete excluído');
      await loadData();
    } catch (err) { console.error(err); toast.error('Erro ao excluir lembrete'); }
  };

  const openNewDrop = () => {
    setEditDrop(null);
    setDDrop(''); setDData(''); setDPreco(''); setDMeta(''); setDObs('');
    setShowDrop(true);
  };

  const openEditDrop = (d: DropPlan) => {
    setEditDrop(d);
    setDDrop(String(d.drop)); setDData(d.dataPrevista); setDPreco(String(d.precoMaximo));
    setDMeta(String(d.metaPecas)); setDObs(d.observacoes);
    setShowDrop(true);
  };

  const saveDrop = async () => {
    if (!dDrop || !dData) { toast.error('Número do drop e data são obrigatórios'); return; }
    try {
      const plan: DropPlan = {
        drop: Number(dDrop), dataPrevista: dData,
        precoMaximo: Number(dPreco) || 0, metaPecas: Number(dMeta) || 0, observacoes: dObs,
      };
      if (!editDrop) {
        const exists = dropPlans.some(d => d.drop === plan.drop);
        if (exists) { toast.error('Esse drop já existe'); return; }
      }
      await supabaseStore.upsertDropPlan(plan);
      toast.success(editDrop ? 'Drop atualizado' : 'Drop criado');
      setShowDrop(false);
      await loadData();
    } catch (err) { console.error(err); toast.error('Erro ao salvar drop'); }
  };

  const deleteDrop = async (drop: number) => {
    try {
      await supabaseStore.deleteDropPlan(drop);
      toast.success('Drop excluído');
      await loadData();
    } catch (err) { console.error(err); toast.error('Erro ao excluir drop'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-muted-foreground text-sm animate-pulse">Carregando planejamento...</p>
    </div>
  );
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl md:text-4xl tracking-wide text-primary">PLANEJAMENTO</h1>
      </div>

      <Tabs defaultValue="lembretes">
        <TabsList className="bg-muted rounded-full w-full md:w-auto">
          <TabsTrigger value="lembretes" className="rounded-full font-display text-xs md:text-sm tracking-wide flex-1 md:flex-none md:px-6">
            <Bell className="h-3.5 w-3.5 mr-1.5" /> LEMBRETES
          </TabsTrigger>
          <TabsTrigger value="drops" className="rounded-full font-display text-xs md:text-sm tracking-wide flex-1 md:flex-none md:px-6">
            <Package className="h-3.5 w-3.5 mr-1.5" /> DROPS
          </TabsTrigger>
        </TabsList>

        {/* === LEMBRETES === */}
        <TabsContent value="lembretes" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filtroResp} onValueChange={setFiltroResp}>
              <SelectTrigger className="w-full sm:w-48 rounded-full bg-card border-border text-sm">
                <SelectValue placeholder="Filtrar responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {responsaveis.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={openNewLembrete} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold tracking-wide text-xs">
              <Plus className="h-4 w-4 mr-1" /> Novo Lembrete
            </Button>
          </div>

          {pendentes.length > 0 ? (
            <div className="space-y-3">
              {pendentes.map(l => (
                <LembreteCard key={l.id} lembrete={l} onToggle={toggleConcluido} onEdit={openEditLembrete} onDelete={deleteLembrete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Bell className="h-8 w-8 mx-auto mb-3 opacity-30" />
              Nenhum lembrete pendente 🎉
            </div>
          )}

          {concluidos.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-xs font-bold text-muted-foreground uppercase tracking-widest py-2">
                Concluídos ({concluidos.length})
              </summary>
              <div className="space-y-3 mt-2">
                {concluidos.map(l => (
                  <LembreteCard key={l.id} lembrete={l} onToggle={toggleConcluido} onEdit={openEditLembrete} onDelete={deleteLembrete} />
                ))}
              </div>
            </details>
          )}
        </TabsContent>

        {/* === DROPS === */}
        <TabsContent value="drops" className="mt-4 space-y-4">
          <Button onClick={openNewDrop} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold tracking-wide text-xs">
            <CalendarPlus className="h-4 w-4 mr-1" /> Planejar Drop
          </Button>

          {dropPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dropPlans.sort((a, b) => a.drop - b.drop).map(d => {
                const cadastradas = pecas.filter(p => p.drop === d.drop).length;
                const progress = d.metaPecas > 0 ? Math.min((cadastradas / d.metaPecas) * 100, 100) : 0;
                return (
                  <div key={d.drop} className="card-editorial p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl tracking-wide text-primary">DROP {d.drop}</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openEditDrop(d)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => deleteDrop(d.drop)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Data Prevista</p>
                        <p className="font-medium">{new Date(d.dataPrevista + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Preço Máximo</p>
                        <p className="font-medium">R$ {d.precoMaximo.toFixed(2)}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Peças</p>
                        <p className="text-xs font-bold text-primary">{cadastradas} / {d.metaPecas}</p>
                      </div>
                      <Progress value={progress} className="h-2 rounded-full" />
                    </div>

                    {d.observacoes && (
                      <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">{d.observacoes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Package className="h-8 w-8 mx-auto mb-3 opacity-30" />
              Nenhum drop planejado ainda
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog — Novo/Editar Lembrete */}
      <Dialog open={showLembrete} onOpenChange={setShowLembrete}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg tracking-wide text-primary">
              {editLembrete ? 'EDITAR LEMBRETE' : 'NOVO LEMBRETE'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Título</Label>
              <Input value={lTitulo} onChange={e => setLTitulo(e.target.value)} className="mt-1 rounded-xl" placeholder="Ex: Postar fotos do drop 5" />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Descrição</Label>
              <Input value={lDescricao} onChange={e => setLDescricao(e.target.value)} className="mt-1 rounded-xl" placeholder="Detalhes..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Data Limite</Label>
                <Input type="date" value={lDataLimite} onChange={e => setLDataLimite(e.target.value)} className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Responsável</Label>
                <div className="mt-2 space-y-2">
                  {responsaveis.map(r => (
                    <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={lResponsavel.includes(r)}
                        onCheckedChange={() => toggleResponsavel(r)}
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveLembrete} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold tracking-wide w-full">
              {editLembrete ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog — Novo/Editar Drop */}
      <Dialog open={showDrop} onOpenChange={setShowDrop}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg tracking-wide text-primary">
              {editDrop ? 'EDITAR DROP' : 'PLANEJAR DROP'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Nº do Drop</Label>
                <Input type="number" value={dDrop} onChange={e => setDDrop(e.target.value)} className="mt-1 rounded-xl" disabled={!!editDrop} />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Data Prevista</Label>
                <Input type="date" value={dData} onChange={e => setDData(e.target.value)} className="mt-1 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Preço Máx/Peça</Label>
                <Input type="number" step="0.01" value={dPreco} onChange={e => setDPreco(e.target.value)} className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Meta de Peças</Label>
                <Input type="number" value={dMeta} onChange={e => setDMeta(e.target.value)} className="mt-1 rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Observações</Label>
              <Input value={dObs} onChange={e => setDObs(e.target.value)} className="mt-1 rounded-xl" placeholder="Notas sobre esse drop..." />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveDrop} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold tracking-wide w-full">
              {editDrop ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component: LembreteCard
function LembreteCard({ lembrete: l, onToggle, onEdit, onDelete }: {
  lembrete: Lembrete;
  onToggle: (id: string) => void;
  onEdit: (l: Lembrete) => void;
  onDelete: (id: string) => void;
}) {
  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0);
  const isOverdue = l.dataLimite && !l.concluido && new Date(l.dataLimite + 'T00:00:00') < todayLocal;

  return (
    <div className={`p-4 rounded-2xl border transition-all ${l.concluido ? 'bg-muted/30 border-border opacity-60' : isOverdue ? 'bg-destructive/5 border-destructive/30' : 'bg-card border-border'}`}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggle(l.id)} className="mt-0.5 shrink-0">
          <CheckCircle className={`h-5 w-5 transition-colors ${l.concluido ? 'text-accent fill-accent/20' : 'text-muted-foreground/30 hover:text-accent'}`} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-display text-sm tracking-wide ${l.concluido ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {l.titulo}
            </h4>
            <div className="flex gap-1 shrink-0 flex-wrap justify-end">
              {l.responsavel.map(r => (
                <Badge key={r} className={`text-[10px] border-none ${responsavelColors[r] || ''}`}>
                  {r}
                </Badge>
              ))}
            </div>
          </div>
          {l.descricao && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{l.descricao}</p>}
          <div className="flex items-center gap-3 mt-2">
            {l.dataLimite && (
              <span className={`text-[10px] ${isOverdue ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                📅 {new Date(l.dataLimite + 'T12:00:00').toLocaleDateString('pt-BR')}
                {isOverdue && ' — Atrasado!'}
              </span>
            )}
            <div className="ml-auto flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => onEdit(l)}>
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-destructive" onClick={() => onDelete(l.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
