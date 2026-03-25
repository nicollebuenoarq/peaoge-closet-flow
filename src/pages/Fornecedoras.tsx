import { useState, useMemo } from 'react';
import { store } from '@/lib/store';
import { Fornecedora } from '@/types';
import { fmt } from '@/lib/fmt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Star, Search, Phone, Key, Users, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const avatarColors = ['#e8527a', '#4a7a4b', '#2d4a2e', '#d4a76a', '#7a4a6b', '#4a6b7a'];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

const topBarColors = ['#2d4a2e', '#e8527a', '#3ab5a0'];
const iconBgs = ['bg-primary/10 text-primary', 'bg-accent/10 text-accent', 'bg-[#3ab5a0]/10 text-[#3ab5a0]'];

export default function Fornecedoras() {
  const [, setTick] = useState(0);
  const reload = () => setTick(t => t + 1);

  const fornecedoras = store.getFornecedoras();
  const pecas = store.getPecas();
  const vendas = store.getVendas();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Fornecedora | null>(null);
  const [detailForn, setDetailForn] = useState<Fornecedora | null>(null);

  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [busca, setBusca] = useState('');

  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [ativa, setAtiva] = useState(true);
  const [ehSocia, setEhSocia] = useState(false);

  const filtered = useMemo(() => {
    return fornecedoras.filter(f => {
      if (tipoFilter === 'socia' && !f.ehSocia) return false;
      if (tipoFilter === 'externa' && f.ehSocia) return false;
      if (statusFilter === 'ativa' && !f.ativa) return false;
      if (statusFilter === 'inativa' && f.ativa) return false;
      if (busca && !f.nome.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [fornecedoras, tipoFilter, statusFilter, busca]);

  // Summary totals
  const totalPendenteGeral = vendas.filter(v => !v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);
  const totalPagoGeral = vendas.filter(v => v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);

  const openNew = () => {
    setEditing(null);
    setNome(''); setContato(''); setChavePix(''); setObservacoes(''); setAtiva(true); setEhSocia(false);
    setShowForm(true);
  };

  const openEdit = (f: Fornecedora) => {
    setEditing(f);
    setNome(f.nome); setContato(f.contato); setChavePix(f.chavePix); setObservacoes(f.observacoes); setAtiva(f.ativa); setEhSocia(f.ehSocia);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editing) {
      const all = fornecedoras.map(f => f.id === editing.id ? { ...f, nome, contato, chavePix, observacoes, ativa, ehSocia } : f);
      store.setFornecedoras(all);
      toast.success(`Fornecedora "${nome}" atualizada`);
    } else {
      const nova: Fornecedora = { id: crypto.randomUUID(), nome, contato, chavePix, observacoes, ativa, ehSocia };
      store.setFornecedoras([...fornecedoras, nova]);
      toast.success(`Fornecedora "${nome}" cadastrada`);
    }
    setShowForm(false);
    reload();
  };

  const detailPecas = detailForn ? pecas.filter(p => p.fornecedoraId === detailForn.id) : [];
  const detailVendas = detailForn ? vendas.filter(v => v.fornecedoraId === detailForn.id) : [];
  const detailTotalPago = detailVendas.filter(v => v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);
  const detailTotalPendente = detailVendas.filter(v => !v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);
  const detailTotal = detailTotalPago + detailTotalPendente;
  const detailProgress = detailTotal > 0 ? (detailTotalPago / detailTotal) * 100 : 0;

  const summaryCards = [
    { label: 'TOTAL FORNECEDORAS', value: String(fornecedoras.length), icon: Users, colorIdx: 0 },
    { label: 'TOTAL PENDENTE', value: fmt(totalPendenteGeral), icon: AlertCircle, colorIdx: 1 },
    { label: 'TOTAL PAGO', value: fmt(totalPagoGeral), icon: CheckCircle, colorIdx: 2 },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="font-display text-4xl md:text-5xl text-primary tracking-wide">FORNECEDORAS</h1>

      {/* Summary mini-cards */}
      <div className="grid grid-cols-3 gap-4 animate-stagger">
        {summaryCards.map((card, i) => (
          <div
            key={card.label}
            className="bg-card border border-border overflow-hidden transition-transform duration-300 hover:translate-y-[-2px]"
            style={{ borderRadius: '0 0 16px 16px' }}
          >
            <div className="h-[3px]" style={{ backgroundColor: topBarColors[i] }} />
            <div className="p-4">
              <div className={`icon-circle h-9 w-9 mb-2 rounded-full ${iconBgs[i]}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <p className="font-display text-2xl leading-none text-foreground">{card.value}</p>
              <p className="label-upper mt-1.5 text-[9px]">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="filter-bar flex flex-wrap gap-4 items-end">
        <div>
          <Label className="label-upper">Tipo</Label>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-28 rounded-full bg-muted/50 border-0 mt-1 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas ({fornecedoras.length})</SelectItem>
              <SelectItem value="socia">Sócias ({fornecedoras.filter(f => f.ehSocia).length})</SelectItem>
              <SelectItem value="externa">Externas ({fornecedoras.filter(f => !f.ehSocia).length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="label-upper">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28 rounded-full bg-muted/50 border-0 mt-1 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="ativa">Ativas ({fornecedoras.filter(f => f.ativa).length})</SelectItem>
              <SelectItem value="inativa">Inativas ({fornecedoras.filter(f => !f.ativa).length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <Label className="label-upper">Buscar</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 rounded-full bg-muted/50 border-0 text-sm" placeholder="Nome..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
        </div>
        <Button onClick={openNew} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs">
          <Plus className="h-4 w-4 mr-1" /> NOVA FORNECEDORA
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} fornecedoras</p>

      {/* Cards grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 animate-stagger">
        {filtered.map(f => {
          const totalPecas = pecas.filter(p => p.fornecedoraId === f.id).length;
          const vendasF = vendas.filter(v => v.fornecedoraId === f.id);
          const totalVendido = vendasF.reduce((s, v) => s + v.precoFinal, 0);
          const totalPago = vendasF.filter(v => v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);
          const totalPendente = vendasF.filter(v => !v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);
          const totalComissao = totalPago + totalPendente;
          const progress = totalComissao > 0 ? (totalPago / totalComissao) * 100 : 0;

          return (
            <div
              key={f.id}
              className={`card-editorial cursor-pointer p-6 ${!f.ativa ? 'opacity-50' : ''}`}
              onClick={() => setDetailForn(f)}
            >
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0 font-display"
                  style={{ backgroundColor: getAvatarColor(f.nome) }}
                >
                  {f.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg truncate flex items-center gap-2 tracking-wide">
                    {f.nome.toUpperCase()}
                    {f.ehSocia && (
                      <span className="pill-badge bg-accent/20 text-accent text-[10px] gap-0.5">
                        <Star className="h-3 w-3 fill-current" /> Sócia
                      </span>
                    )}
                  </h3>
                  {!f.ativa && <Badge variant="outline" className="text-[10px] mt-1 rounded-full">Inativa</Badge>}
                </div>
                <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0 rounded-full" onClick={(e) => { e.stopPropagation(); openEdit(f); }}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5 mb-5">
                {f.contato && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> {f.contato}
                  </p>
                )}
                {f.chavePix && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Key className="h-3.5 w-3.5" /> {f.chavePix}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 rounded-2xl bg-muted/40">
                  <p className="label-upper text-[9px]">Peças</p>
                  <p className="font-display text-xl">{totalPecas}</p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-muted/40">
                  <p className="label-upper text-[9px]">Vendido</p>
                  <p className="font-mono-price text-xs">{fmt(totalVendido)}</p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-muted/40">
                  <p className="label-upper text-[9px]">Pendente</p>
                  <p className="font-mono-price text-xs text-destructive">{fmt(totalPendente)}</p>
                </div>
              </div>

              {/* Progress bar */}
              {totalComissao > 0 && (
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                    <span>Pago: {fmt(totalPago)}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5 rounded-full" />
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full empty-state">
            <Users className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-xl font-display">NENHUMA FORNECEDORA ENCONTRADA</p>
            <p className="text-sm mt-1">Tente ajustar os filtros ou cadastre uma nova</p>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md overflow-hidden rounded-2xl">
          <DialogHeader className="bg-primary -mx-6 -mt-6 px-6 pt-6 pb-4 mb-2">
            <DialogTitle className="font-display text-xl text-white tracking-wide">{editing ? 'EDITAR' : 'NOVA'} FORNECEDORA</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div><Label className="label-upper">Nome</Label><Input value={nome} onChange={e => setNome(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
            <div><Label className="label-upper">Contato (telefone)</Label><Input value={contato} onChange={e => setContato(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
            <div><Label className="label-upper">Chave Pix</Label><Input value={chavePix} onChange={e => setChavePix(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
            <div><Label className="label-upper">Observações</Label><Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={ativa} onCheckedChange={setAtiva} /><Label className="text-sm">Ativa</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={ehSocia} onCheckedChange={setEhSocia} /><Label className="text-sm">Sócia</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-5">
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-full text-xs">Cancelar</Button>
            <Button onClick={handleSave} disabled={!nome} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={!!detailForn} onOpenChange={() => setDetailForn(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detailForn && (
            <>
              <SheetHeader className="pb-5 border-b">
                <div className="flex items-center gap-4">
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white font-display"
                    style={{ backgroundColor: getAvatarColor(detailForn.nome) }}
                  >
                    {detailForn.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <SheetTitle className="font-display text-2xl flex items-center gap-2 tracking-wide">
                      {detailForn.nome.toUpperCase()}
                      {detailForn.ehSocia && (
                        <span className="pill-badge bg-accent/20 text-accent text-[10px] gap-0.5">
                          <Star className="h-3 w-3 fill-current" /> Sócia
                        </span>
                      )}
                    </SheetTitle>
                    {detailForn.contato && <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1"><Phone className="h-3 w-3" /> {detailForn.contato}</p>}
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {detailForn.chavePix && (
                  <p className="text-sm flex items-center gap-2 text-muted-foreground"><Key className="h-4 w-4" /> {detailForn.chavePix}</p>
                )}
                {detailForn.observacoes && (
                  <p className="text-sm text-muted-foreground bg-muted/40 p-4 rounded-2xl">{detailForn.observacoes}</p>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 rounded-2xl bg-muted/40">
                    <p className="label-upper text-[9px]">Peças</p>
                    <p className="font-display text-2xl">{detailPecas.length}</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-status-available/10">
                    <p className="label-upper text-[9px]">Pago</p>
                    <p className="font-mono-price text-xs text-status-available">{fmt(detailTotalPago)}</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-destructive/5">
                    <p className="label-upper text-[9px]">Pendente</p>
                    <p className="font-mono-price text-xs text-destructive">{fmt(detailTotalPendente)}</p>
                  </div>
                </div>

                {/* Progress */}
                {detailTotal > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                      <span>Progresso de pagamento</span>
                      <span>{Math.round(detailProgress)}%</span>
                    </div>
                    <Progress value={detailProgress} className="h-1.5 rounded-full" />
                  </div>
                )}

                {detailVendas.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm mb-3 tracking-wide">VENDAS ({detailVendas.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {detailVendas.map(v => (
                        <div key={v.id} className="flex justify-between items-center p-4 rounded-2xl bg-card border text-sm hover:bg-muted/20 transition-all duration-200">
                          <div>
                            <span className="text-muted-foreground font-mono-price text-xs">#{v.skuPeca}</span>{' '}
                            <span className="font-medium">{v.descricaoPeca}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">{v.dataVenda} • {v.compradora || 'Sem compradora'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono-price text-primary text-xs">{fmt(v.precoFinal)}</p>
                            <span className={`pill-badge text-[10px] mt-1 ${v.pagoFornecedora ? 'bg-status-available/15 text-status-available' : 'bg-destructive/10 text-destructive'}`}>
                              {v.pagoFornecedora ? '✓ Pago' : 'Pendente'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailPecas.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm mb-3 tracking-wide">PEÇAS ({detailPecas.length})</h4>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {detailPecas.map(p => (
                        <div key={p.sku} className="flex justify-between items-center p-3 rounded-xl bg-card border text-sm hover:bg-muted/20 transition-all duration-200">
                          <span><span className="text-muted-foreground font-mono-price text-xs">#{p.sku}</span> {p.descricao}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-price text-primary text-xs">{fmt(p.preco)}</span>
                            <span className={`pill-badge text-[10px] ${
                              p.status === 'Disponível' ? 'bg-status-available/15 text-status-available' :
                              p.status === 'Vendido' ? 'bg-status-sold/15 text-status-sold' :
                              p.status === 'Reservado' ? 'bg-status-reserved/15 text-status-reserved' :
                              'bg-status-returned/15 text-status-returned'
                            }`}>{p.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
