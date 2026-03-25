import { useState, useMemo } from 'react';
import { store } from '@/lib/store';
import { Peca, StatusPeca, MeioPagamento, Venda } from '@/types';
import { fmt } from '@/lib/fmt';
import { exportCSV } from '@/lib/csv';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, Search, ShoppingCart, Edit, Trash2, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<StatusPeca, string> = {
  'Disponível': 'bg-status-available/15 text-status-available border-status-available/30',
  'Vendido': 'bg-status-sold/15 text-status-sold border-status-sold/30',
  'Reservado': 'bg-status-reserved/15 text-status-reserved border-status-reserved/30',
  'Devolvido': 'bg-status-returned/15 text-status-returned border-status-returned/30',
};

type SortKey = 'sku' | 'descricao' | 'categoria' | 'preco' | 'drop' | 'status' | 'dataEntrada';
type SortDir = 'asc' | 'desc';

function SortIcon({ column, sortBy, sortDir }: { column: SortKey; sortBy: SortKey | null; sortDir: SortDir }) {
  if (sortBy !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
  return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
}

export default function Catalogo() {
  const [, setTick] = useState(0);
  const reload = () => setTick(t => t + 1);

  const config = store.getConfig();
  const fornecedoras = store.getFornecedoras();
  const pecas = store.getPecas();

  const [dropFilter, setDropFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [fornFilter, setFornFilter] = useState<string>('all');
  const [busca, setBusca] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingPeca, setEditingPeca] = useState<Peca | null>(null);
  const [selectedPeca, setSelectedPeca] = useState<Peca | null>(null);
  const [showVenda, setShowVenda] = useState<Peca | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Peca | null>(null);
  const [showStatusWarning, setShowStatusWarning] = useState<{ peca: Peca; newStatus: StatusPeca } | null>(null);

  // Sort state
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Form fields
  const [formDescricao, setFormDescricao] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formTamanho, setFormTamanho] = useState('');
  const [formFornecedoraId, setFormFornecedoraId] = useState('');
  const [formPreco, setFormPreco] = useState('');
  const [formDrop, setFormDrop] = useState(String(config.dropAtual));

  // Venda form
  const [vendaDesconto, setVendaDesconto] = useState('0');
  const [vendaPagamento, setVendaPagamento] = useState<string>('Pix');
  const [vendaCompradora, setVendaCompradora] = useState('');
  const [vendaEndereco, setVendaEndereco] = useState('');
  const [vendaDataEntrega, setVendaDataEntrega] = useState('');

  const drops = useMemo(() => {
    const s = new Set<number>();
    pecas.forEach(p => s.add(p.drop));
    return Array.from(s).sort((a, b) => a - b);
  }, [pecas]);

  const categorias = useMemo(() => Array.from(new Set(pecas.map(p => p.categoria).filter(Boolean))), [pecas]);

  // Counts for filters
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    config.statusValidos.forEach(s => { counts[s] = pecas.filter(p => p.status === s).length; });
    return counts;
  }, [pecas, config.statusValidos]);

  const dropCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    drops.forEach(d => { counts[d] = pecas.filter(p => p.drop === d).length; });
    return counts;
  }, [pecas, drops]);

  const filtered = useMemo(() => {
    let result = pecas.filter(p => {
      if (dropFilter !== 'all' && p.drop !== Number(dropFilter)) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (fornFilter !== 'all' && p.fornecedoraId !== fornFilter) return false;
      if (catFilter !== 'all' && p.categoria !== catFilter) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (!p.descricao.toLowerCase().includes(q) && !String(p.sku).includes(q)) return false;
      }
      return true;
    });

    if (sortBy) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'sku' || sortBy === 'preco' || sortBy === 'drop') {
          cmp = (a[sortBy] as number) - (b[sortBy] as number);
        } else {
          cmp = String(a[sortBy]).localeCompare(String(b[sortBy]), 'pt-BR');
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [pecas, dropFilter, statusFilter, fornFilter, catFilter, busca, sortBy, sortDir]);

  // Totals
  const totalPreco = filtered.reduce((s, p) => s + p.preco, 0);
  const totalDisponivel = filtered.filter(p => p.status === 'Disponível').length;

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const openNew = () => {
    setEditingPeca(null);
    setFormDescricao(''); setFormCategoria(''); setFormTamanho(''); setFormFornecedoraId('');
    setFormPreco(''); setFormDrop(String(config.dropAtual));
    setShowForm(true);
  };

  const openEdit = (p: Peca) => {
    setEditingPeca(p);
    setFormDescricao(p.descricao); setFormCategoria(p.categoria); setFormTamanho(p.tamanho);
    setFormFornecedoraId(p.fornecedoraId); setFormPreco(String(p.preco)); setFormDrop(String(p.drop));
    setShowForm(true);
  };

  const handleSave = () => {
    const preco = parseFloat(formPreco) || 0;
    if (preco <= 0 && !editingPeca) {
      toast.warning('Atenção: peça cadastrada com preço R$ 0,00');
    }

    if (editingPeca) {
      const all = store.getPecas().map(p =>
        p.sku === editingPeca.sku
          ? { ...p, descricao: formDescricao, categoria: formCategoria, tamanho: formTamanho, fornecedoraId: formFornecedoraId, preco, drop: parseInt(formDrop) || config.dropAtual }
          : p
      );
      store.setPecas(all);
      setSelectedPeca(prev => prev?.sku === editingPeca.sku ? { ...prev, descricao: formDescricao, categoria: formCategoria, tamanho: formTamanho, fornecedoraId: formFornecedoraId, preco, drop: parseInt(formDrop) || config.dropAtual } : prev);
      toast.success(`Peça #${editingPeca.sku} atualizada`);
    } else {
      const sku = store.getNextSku();
      const nova: Peca = {
        sku,
        descricao: formDescricao,
        categoria: formCategoria,
        tamanho: formTamanho,
        fornecedoraId: formFornecedoraId,
        dataEntrada: new Date().toISOString().split('T')[0],
        status: 'Disponível',
        preco,
        drop: parseInt(formDrop) || config.dropAtual,
      };
      store.setPecas([...pecas, nova]);
      store.setNextSku(sku + 1);
      toast.success(`Peça #${sku} cadastrada`);
    }
    setShowForm(false);
    reload();
  };

  const handleDelete = (peca: Peca) => {
    const all = store.getPecas().filter(p => p.sku !== peca.sku);
    store.setPecas(all);
    // Remove associated sales
    const vendas = store.getVendas().filter(v => v.skuPeca !== peca.sku);
    store.setVendas(vendas);
    setShowDeleteConfirm(null);
    setSelectedPeca(null);
    toast.success(`Peça #${peca.sku} excluída`);
    reload();
  };

  const handleStatusChange = (sku: number, newStatus: StatusPeca) => {
    const peca = pecas.find(p => p.sku === sku);
    if (peca && peca.status === 'Vendido' && newStatus !== 'Vendido') {
      setShowStatusWarning({ peca, newStatus });
      return;
    }
    applyStatusChange(sku, newStatus);
  };

  const applyStatusChange = (sku: number, status: StatusPeca) => {
    const all = store.getPecas().map(p => p.sku === sku ? { ...p, status } : p);
    store.setPecas(all);
    setSelectedPeca(prev => prev ? { ...prev, status } : null);
    setShowStatusWarning(null);
    toast.success(`Status alterado para "${status}"`);
    reload();
  };

  const handleVenda = () => {
    if (!showVenda) return;
    const peca = showVenda;
    const desconto = parseFloat(vendaDesconto) || 0;
    const precoFinal = peca.preco - desconto;

    if (precoFinal < 0) {
      toast.error('Desconto não pode ser maior que o preço!');
      return;
    }

    const pagamento = vendaPagamento as MeioPagamento;
    const base = pagamento === 'Cartão Crédito' ? precoFinal * (1 - config.taxaCartao) : precoFinal;

    const venda: Venda = {
      id: crypto.randomUUID(),
      dataVenda: new Date().toISOString().split('T')[0],
      skuPeca: peca.sku,
      descricaoPeca: peca.descricao,
      fornecedoraId: peca.fornecedoraId,
      drop: peca.drop,
      desconto,
      precoFinal,
      pagamento,
      comissaoFornecedora: base * config.percentualFornecedora,
      parcelaBrecho: base * config.percentualBrecho,
      pagoFornecedora: false,
      dataPagamento: null,
      compradora: vendaCompradora,
      enderecoEntrega: vendaEndereco,
      dataEntrega: vendaDataEntrega || null,
    };

    const vendas = store.getVendas();
    store.setVendas([...vendas, venda]);

    const allPecas = store.getPecas().map(p => p.sku === peca.sku ? { ...p, status: 'Vendido' as StatusPeca } : p);
    store.setPecas(allPecas);

    setShowVenda(null);
    setVendaDesconto('0'); setVendaCompradora(''); setVendaEndereco(''); setVendaDataEntrega('');
    toast.success(`Venda registrada: #${peca.sku}`);
    reload();
  };

  const handleExportCSV = () => {
    const headers = ['SKU', 'Descrição', 'Categoria', 'Tamanho', 'Fornecedora', 'Entrada', 'Status', 'Preço', 'DROP'];
    const rows = filtered.map(p => [p.sku, p.descricao, p.categoria, p.tamanho, getFornNome(p.fornecedoraId), p.dataEntrada, p.status, p.preco, p.drop]);
    exportCSV('catalogo.csv', headers, rows);
    toast.success('CSV exportado');
  };

  const getFornNome = (id: string) => fornecedoras.find(f => f.id === id)?.nome || '—';

  const vendaPrecoFinal = showVenda ? showVenda.preco - (parseFloat(vendaDesconto) || 0) : 0;
  const vendaBase = showVenda && vendaPagamento === 'Cartão Crédito' ? vendaPrecoFinal * (1 - config.taxaCartao) : vendaPrecoFinal;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label className="text-xs">DROP</Label>
          <Select value={dropFilter} onValueChange={setDropFilter}>
            <SelectTrigger className="w-32 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {drops.map(d => <SelectItem key={d} value={String(d)}>Drop {d} ({dropCounts[d]})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos ({pecas.length})</SelectItem>
              {config.statusValidos.map(s => <SelectItem key={s} value={s}>{s} ({statusCounts[s] || 0})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Fornecedora</Label>
          <Select value={fornFilter} onValueChange={setFornFilter}>
            <SelectTrigger className="w-36 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {fornecedoras.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {categorias.length > 0 && (
          <div>
            <Label className="text-xs">Categoria</Label>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-32 bg-card"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex-1 min-w-[180px]">
          <Label className="text-xs">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 bg-card" placeholder="SKU ou descrição..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
        </div>
        <Button variant="outline" onClick={handleExportCSV} className="shrink-0">
          <Download className="h-4 w-4 mr-1" /> CSV
        </Button>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Nova Peça
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground bg-muted/30">
                  <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('sku')}>
                    <span className="flex items-center">SKU <SortIcon column="sku" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('descricao')}>
                    <span className="flex items-center">Descrição <SortIcon column="descricao" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('categoria')}>
                    <span className="flex items-center">Categoria <SortIcon column="categoria" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="p-3">Tam.</th>
                  <th className="p-3">Fornecedora</th>
                  <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('dataEntrada')}>
                    <span className="flex items-center">Entrada <SortIcon column="dataEntrada" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('status')}>
                    <span className="flex items-center">Status <SortIcon column="status" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('preco')}>
                    <span className="flex items-center">Preço <SortIcon column="preco" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('drop')}>
                    <span className="flex items-center">DROP <SortIcon column="drop" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.sku} className="border-b last:border-0 hover:bg-muted/20 cursor-pointer" onClick={() => setSelectedPeca(p)}>
                    <td className="p-3 font-mono text-xs">#{p.sku}</td>
                    <td className="p-3 font-medium">{p.descricao}</td>
                    <td className="p-3">{p.categoria}</td>
                    <td className="p-3">{p.tamanho}</td>
                    <td className="p-3">{getFornNome(p.fornecedoraId)}</td>
                    <td className="p-3 text-xs">{p.dataEntrada}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={statusColors[p.status]}>{p.status}</Badge>
                    </td>
                    <td className="p-3 font-semibold">{fmt(p.preco)}</td>
                    <td className="p-3">{p.drop}</td>
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        {p.status === 'Disponível' && (
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setShowVenda(p); setVendaDesconto('0'); setVendaPagamento('Pix'); }}>
                            <ShoppingCart className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">Nenhuma peça encontrada</td></tr>
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t bg-muted/20 font-semibold">
                    <td className="p-3" colSpan={6}>{filtered.length} peças ({totalDisponivel} disponíveis)</td>
                    <td className="p-3"></td>
                    <td className="p-3">{fmt(totalPreco)}</td>
                    <td className="p-3" colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Nova/Editar Peça Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading">{editingPeca ? `Editar Peça #${editingPeca.sku}` : 'Nova Peça'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Descrição</Label><Input value={formDescricao} onChange={e => setFormDescricao(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Categoria</Label><Input value={formCategoria} onChange={e => setFormCategoria(e.target.value)} /></div>
              <div><Label>Tamanho</Label><Input value={formTamanho} onChange={e => setFormTamanho(e.target.value)} /></div>
            </div>
            <div>
              <Label>Fornecedora</Label>
              <Select value={formFornecedoraId} onValueChange={setFormFornecedoraId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {fornecedoras.filter(f => f.ativa).map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={formPreco} onChange={e => setFormPreco(e.target.value)} /></div>
              <div><Label>DROP</Label><Input type="number" value={formDrop} onChange={e => setFormDrop(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formDescricao || !formFornecedoraId}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={!!selectedPeca} onOpenChange={() => setSelectedPeca(null)}>
        <SheetContent>
          {selectedPeca && (
            <>
              <SheetHeader>
                <SheetTitle className="font-heading">Peça #{selectedPeca.sku}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div><p className="text-xs text-muted-foreground">Descrição</p><p className="font-medium">{selectedPeca.descricao}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Categoria</p><p>{selectedPeca.categoria}</p></div>
                  <div><p className="text-xs text-muted-foreground">Tamanho</p><p>{selectedPeca.tamanho}</p></div>
                </div>
                <div><p className="text-xs text-muted-foreground">Fornecedora</p><p>{getFornNome(selectedPeca.fornecedoraId)}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Preço</p><p className="font-bold">{fmt(selectedPeca.preco)}</p></div>
                  <div><p className="text-xs text-muted-foreground">DROP</p><p>{selectedPeca.drop}</p></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className={statusColors[selectedPeca.status]}>{selectedPeca.status}</Badge>
                </div>
                <div>
                  <Label className="text-xs">Alterar Status</Label>
                  <Select value={selectedPeca.status} onValueChange={(v) => handleStatusChange(selectedPeca.sku, v as StatusPeca)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {config.statusValidos.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  {selectedPeca.status === 'Disponível' && (
                    <Button className="flex-1" onClick={() => { setShowVenda(selectedPeca); setSelectedPeca(null); setVendaDesconto('0'); setVendaPagamento('Pix'); }}>
                      <ShoppingCart className="h-4 w-4 mr-2" /> Vender
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1" onClick={() => { openEdit(selectedPeca); setSelectedPeca(null); }}>
                    <Edit className="h-4 w-4 mr-2" /> Editar
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => setShowDeleteConfirm(selectedPeca)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Comissão Fornecedora: {fmt(selectedPeca.preco * config.percentualFornecedora)}</p>
                  <p className="text-xs text-muted-foreground">Parcela Brechó: {fmt(selectedPeca.preco * config.percentualBrecho)}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirm */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Peça</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a peça #{showDeleteConfirm?.sku} — {showDeleteConfirm?.descricao}? As vendas associadas também serão removidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Warning */}
      <Dialog open={!!showStatusWarning} onOpenChange={() => setShowStatusWarning(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Atenção</DialogTitle>
            <DialogDescription>
              Esta peça está marcada como "Vendido". Alterar o status pode desconectar da venda registrada. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusWarning(null)}>Cancelar</Button>
            <Button onClick={() => showStatusWarning && applyStatusChange(showStatusWarning.peca.sku, showStatusWarning.newStatus)}>Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Venda Dialog */}
      <Dialog open={!!showVenda} onOpenChange={() => setShowVenda(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading">Registrar Venda</DialogTitle></DialogHeader>
          {showVenda && (
            <div className="space-y-3">
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="font-medium">#{showVenda.sku} — {showVenda.descricao}</p>
                <p className="text-sm text-muted-foreground">{getFornNome(showVenda.fornecedoraId)} • Drop {showVenda.drop} • {fmt(showVenda.preco)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Desconto (R$)</Label><Input type="number" step="0.01" value={vendaDesconto} onChange={e => setVendaDesconto(e.target.value)} /></div>
                <div><Label>Pagamento</Label>
                  <Select value={vendaPagamento} onValueChange={setVendaPagamento}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {config.meiosPagamento.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg text-sm space-y-1">
                <p>Preço Final: <strong>{fmt(vendaPrecoFinal)}</strong></p>
                {vendaPagamento === 'Cartão Crédito' && <p className="text-xs text-muted-foreground">Taxa 5% aplicada → Base: {fmt(vendaBase)}</p>}
                <p>Comissão Forn.: <strong>{fmt(vendaBase * config.percentualFornecedora)}</strong></p>
                <p>Parcela Brechó: <strong>{fmt(vendaBase * config.percentualBrecho)}</strong></p>
                {vendaPrecoFinal < 0 && <p className="text-destructive font-semibold">⚠️ Desconto maior que o preço!</p>}
              </div>
              <div><Label>Compradora</Label><Input value={vendaCompradora} onChange={e => setVendaCompradora(e.target.value)} /></div>
              <div><Label>Endereço de Entrega</Label><Input value={vendaEndereco} onChange={e => setVendaEndereco(e.target.value)} /></div>
              <div><Label>Data de Entrega</Label><Input type="date" value={vendaDataEntrega} onChange={e => setVendaDataEntrega(e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVenda(null)}>Cancelar</Button>
            <Button onClick={handleVenda} disabled={!showVenda || vendaPrecoFinal < 0}>Confirmar Venda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
