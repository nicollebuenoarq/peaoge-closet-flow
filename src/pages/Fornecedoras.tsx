import { useState, useMemo } from 'react';
import { store } from '@/lib/store';
import { Fornecedora } from '@/types';
import { fmt } from '@/lib/fmt';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Edit, Star, Search, Phone, Key } from 'lucide-react';
import { toast } from 'sonner';

const avatarColors = [
  'bg-primary/15 text-primary',
  'bg-accent/20 text-accent-foreground',
  'bg-secondary/15 text-secondary',
  'bg-destructive/10 text-destructive',
  'bg-status-available/15 text-status-available',
  'bg-status-reserved/15 text-status-reserved',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filter bar */}
      <div className="glass rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tipo</Label>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-28 bg-card/80"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas ({fornecedoras.length})</SelectItem>
              <SelectItem value="socia">Sócias ({fornecedoras.filter(f => f.ehSocia).length})</SelectItem>
              <SelectItem value="externa">Externas ({fornecedoras.filter(f => !f.ehSocia).length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28 bg-card/80"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="ativa">Ativas ({fornecedoras.filter(f => f.ativa).length})</SelectItem>
              <SelectItem value="inativa">Inativas ({fornecedoras.filter(f => !f.ativa).length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 bg-card/80" placeholder="Nome..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
        </div>
        <Button onClick={openNew} className="shadow-md hover:shadow-lg transition-shadow">
          <Plus className="h-4 w-4 mr-1" /> Nova Fornecedora
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} fornecedoras</p>

      {/* Cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-stagger">
        {filtered.map(f => {
          const totalPecas = pecas.filter(p => p.fornecedoraId === f.id).length;
          const vendasF = vendas.filter(v => v.fornecedoraId === f.id);
          const totalVendido = vendasF.reduce((s, v) => s + v.precoFinal, 0);
          const totalPago = vendasF.filter(v => v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);
          const totalPendente = vendasF.filter(v => !v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);
          const totalComissao = totalPago + totalPendente;
          const progress = totalComissao > 0 ? (totalPago / totalComissao) * 100 : 0;

          return (
            <Card
              key={f.id}
              className={`card-elevated cursor-pointer border-0 overflow-hidden ${!f.ativa ? 'opacity-50' : ''}`}
              onClick={() => setDetailForn(f)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  {/* Avatar */}
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${getAvatarColor(f.nome)}`}>
                    {f.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-lg truncate flex items-center gap-2">
                      {f.nome}
                      {f.ehSocia && (
                        <span className="inline-flex items-center gap-0.5 text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3 fill-current" /> Sócia
                        </span>
                      )}
                    </h3>
                    {!f.ativa && <Badge variant="outline" className="text-xs mt-0.5">Inativa</Badge>}
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); openEdit(f); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                {/* Contact info */}
                <div className="space-y-1 mb-4">
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
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Peças</p>
                    <p className="font-bold text-lg">{totalPecas}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Vendido</p>
                    <p className="font-bold text-sm font-mono-price">{fmt(totalVendido)}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground">Pendente</p>
                    <p className="font-bold text-sm font-mono-price text-destructive">{fmt(totalPendente)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                {totalComissao > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Pago: {fmt(totalPago)}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full empty-state">
            <Users className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-lg font-heading">Nenhuma fornecedora encontrada</p>
            <p className="text-sm">Tente ajustar os filtros ou cadastre uma nova</p>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md overflow-hidden">
          <DialogHeader className="bg-primary/5 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-2">
            <DialogTitle className="font-heading text-lg">{editing ? 'Editar' : 'Nova'} Fornecedora</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-xs uppercase tracking-wider text-muted-foreground">Nome</Label><Input value={nome} onChange={e => setNome(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs uppercase tracking-wider text-muted-foreground">Contato (telefone)</Label><Input value={contato} onChange={e => setContato(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs uppercase tracking-wider text-muted-foreground">Chave Pix</Label><Input value={chavePix} onChange={e => setChavePix(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs uppercase tracking-wider text-muted-foreground">Observações</Label><Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="mt-1" /></div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={ativa} onCheckedChange={setAtiva} /><Label>Ativa</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={ehSocia} onCheckedChange={setEhSocia} /><Label>Sócia</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!nome} className="shadow-md">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={!!detailForn} onOpenChange={() => setDetailForn(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detailForn && (
            <>
              <SheetHeader className="pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-xl font-bold ${getAvatarColor(detailForn.nome)}`}>
                    {detailForn.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <SheetTitle className="font-heading flex items-center gap-2">
                      {detailForn.nome}
                      {detailForn.ehSocia && (
                        <span className="inline-flex items-center gap-0.5 text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3 fill-current" /> Sócia
                        </span>
                      )}
                    </SheetTitle>
                    {detailForn.contato && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Phone className="h-3 w-3" /> {detailForn.contato}</p>}
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {detailForn.chavePix && (
                  <p className="text-sm flex items-center gap-2 text-muted-foreground"><Key className="h-4 w-4" /> {detailForn.chavePix}</p>
                )}
                {detailForn.observacoes && (
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{detailForn.observacoes}</p>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground">Peças</p>
                    <p className="font-bold text-xl">{detailPecas.length}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-status-available/10">
                    <p className="text-xs text-muted-foreground">Pago</p>
                    <p className="font-bold text-sm font-mono-price text-status-available">{fmt(detailTotalPago)}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-destructive/5">
                    <p className="text-xs text-muted-foreground">Pendente</p>
                    <p className="font-bold text-sm font-mono-price text-destructive">{fmt(detailTotalPendente)}</p>
                  </div>
                </div>

                {/* Progress */}
                {detailTotal > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progresso de pagamento</span>
                      <span>{Math.round(detailProgress)}%</span>
                    </div>
                    <Progress value={detailProgress} className="h-2" />
                  </div>
                )}

                {detailVendas.length > 0 && (
                  <div>
                    <h4 className="font-heading font-semibold text-sm mb-3">Vendas ({detailVendas.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {detailVendas.map(v => (
                        <div key={v.id} className="flex justify-between items-center p-3 rounded-xl bg-card border text-sm hover:shadow-sm transition-shadow">
                          <div>
                            <span className="font-mono text-xs text-muted-foreground">#{v.skuPeca}</span>{' '}
                            <span className="font-medium">{v.descricaoPeca}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">{v.dataVenda} • {v.compradora || 'Sem compradora'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono-price">{fmt(v.precoFinal)}</p>
                            <Badge variant="outline" className={`text-xs ${v.pagoFornecedora ? 'border-status-available/30 text-status-available' : 'border-destructive/30 text-destructive'}`}>
                              {v.pagoFornecedora ? '✓ Pago' : 'Pendente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailPecas.length > 0 && (
                  <div>
                    <h4 className="font-heading font-semibold text-sm mb-3">Peças ({detailPecas.length})</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {detailPecas.map(p => (
                        <div key={p.sku} className="flex justify-between items-center p-2.5 rounded-lg bg-card border text-sm hover:shadow-sm transition-shadow">
                          <span><span className="font-mono text-xs text-muted-foreground">#{p.sku}</span> {p.descricao}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-price text-xs">{fmt(p.preco)}</span>
                            <Badge variant="outline" className="text-xs">{p.status}</Badge>
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
