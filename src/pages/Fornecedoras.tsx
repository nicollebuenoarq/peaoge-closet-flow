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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Star, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function Fornecedoras() {
  const [, setTick] = useState(0);
  const reload = () => setTick(t => t + 1);

  const fornecedoras = store.getFornecedoras();
  const pecas = store.getPecas();
  const vendas = store.getVendas();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Fornecedora | null>(null);
  const [detailForn, setDetailForn] = useState<Fornecedora | null>(null);

  // Filters
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

  // Detail data
  const detailPecas = detailForn ? pecas.filter(p => p.fornecedoraId === detailForn.id) : [];
  const detailVendas = detailForn ? vendas.filter(v => v.fornecedoraId === detailForn.id) : [];
  const detailTotalPago = detailVendas.filter(v => v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);
  const detailTotalPendente = detailVendas.filter(v => !v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label className="text-xs">Tipo</Label>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-28 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas ({fornecedoras.length})</SelectItem>
              <SelectItem value="socia">Sócias ({fornecedoras.filter(f => f.ehSocia).length})</SelectItem>
              <SelectItem value="externa">Externas ({fornecedoras.filter(f => !f.ehSocia).length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="ativa">Ativas ({fornecedoras.filter(f => f.ativa).length})</SelectItem>
              <SelectItem value="inativa">Inativas ({fornecedoras.filter(f => !f.ativa).length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <Label className="text-xs">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 bg-card" placeholder="Nome..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nova Fornecedora</Button>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} fornecedoras</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(f => {
          const totalPecas = pecas.filter(p => p.fornecedoraId === f.id).length;
          const vendasF = vendas.filter(v => v.fornecedoraId === f.id);
          const totalVendido = vendasF.reduce((s, v) => s + v.precoFinal, 0);
          const totalPago = vendasF.filter(v => v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);
          const totalPendente = vendasF.filter(v => !v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);

          return (
            <Card key={f.id} className={`cursor-pointer transition-shadow hover:shadow-md ${!f.ativa ? 'opacity-60' : ''}`} onClick={() => setDetailForn(f)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                      {f.nome}
                      {f.ehSocia && <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs"><Star className="h-3 w-3 mr-0.5" /> Sócia</Badge>}
                    </h3>
                    {!f.ativa && <Badge variant="outline" className="text-xs mt-1">Inativa</Badge>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(f); }}><Edit className="h-4 w-4" /></Button>
                </div>
                {f.contato && <p className="text-sm text-muted-foreground">📱 {f.contato}</p>}
                {f.chavePix && <p className="text-sm text-muted-foreground">🔑 {f.chavePix}</p>}
                {f.observacoes && <p className="text-sm text-muted-foreground mt-1">{f.observacoes}</p>}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t">
                  <div><p className="text-xs text-muted-foreground">Peças</p><p className="font-bold">{totalPecas}</p></div>
                  <div><p className="text-xs text-muted-foreground">Vendido</p><p className="font-bold text-sm">{fmt(totalVendido)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Pago</p><p className="font-bold text-sm text-secondary">{fmt(totalPago)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Pendente</p><p className="font-bold text-sm text-destructive">{fmt(totalPendente)}</p></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading">{editing ? 'Editar' : 'Nova'} Fornecedora</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome</Label><Input value={nome} onChange={e => setNome(e.target.value)} /></div>
            <div><Label>Contato (telefone)</Label><Input value={contato} onChange={e => setContato(e.target.value)} /></div>
            <div><Label>Chave Pix</Label><Input value={chavePix} onChange={e => setChavePix(e.target.value)} /></div>
            <div><Label>Observações</Label><Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} /></div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={ativa} onCheckedChange={setAtiva} /><Label>Ativa</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={ehSocia} onCheckedChange={setEhSocia} /><Label>Sócia</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!nome}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={!!detailForn} onOpenChange={() => setDetailForn(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detailForn && (
            <>
              <SheetHeader>
                <SheetTitle className="font-heading flex items-center gap-2">
                  {detailForn.nome}
                  {detailForn.ehSocia && <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs"><Star className="h-3 w-3 mr-0.5" /> Sócia</Badge>}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {detailForn.contato && <p className="text-sm">📱 {detailForn.contato}</p>}
                {detailForn.chavePix && <p className="text-sm">🔑 {detailForn.chavePix}</p>}
                {detailForn.observacoes && <p className="text-sm text-muted-foreground">{detailForn.observacoes}</p>}

                <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
                  <div><p className="text-xs text-muted-foreground">Peças</p><p className="font-bold">{detailPecas.length}</p></div>
                  <div><p className="text-xs text-muted-foreground">Pago</p><p className="font-bold text-secondary">{fmt(detailTotalPago)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Pendente</p><p className="font-bold text-destructive">{fmt(detailTotalPendente)}</p></div>
                </div>

                {detailVendas.length > 0 && (
                  <div>
                    <h4 className="font-heading font-semibold text-sm mb-2">Vendas ({detailVendas.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {detailVendas.map(v => (
                        <div key={v.id} className="flex justify-between items-center p-2 rounded-md bg-card border text-sm">
                          <div>
                            <span className="font-mono text-xs">#{v.skuPeca}</span> {v.descricaoPeca}
                            <p className="text-xs text-muted-foreground">{v.dataVenda} • {v.compradora || 'Sem compradora'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{fmt(v.precoFinal)}</p>
                            <Badge variant="outline" className={`text-xs ${v.pagoFornecedora ? 'border-secondary/30 text-secondary' : 'border-destructive/30 text-destructive'}`}>
                              {v.pagoFornecedora ? 'Pago' : 'Pendente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailPecas.length > 0 && (
                  <div>
                    <h4 className="font-heading font-semibold text-sm mb-2">Peças ({detailPecas.length})</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {detailPecas.map(p => (
                        <div key={p.sku} className="flex justify-between items-center p-2 rounded-md bg-card border text-sm">
                          <span><span className="font-mono text-xs">#{p.sku}</span> {p.descricao}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{fmt(p.preco)}</span>
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
