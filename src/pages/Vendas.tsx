import { useState, useMemo } from 'react';
import { store } from '@/lib/store';
import { Venda, Peca, MeioPagamento, StatusPeca } from '@/types';
import { fmt } from '@/lib/fmt';
import { exportCSV } from '@/lib/csv';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Download, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Receipt } from 'lucide-react';
import { toast } from 'sonner';

type SortKey = 'dataVenda' | 'skuPeca' | 'descricaoPeca' | 'precoFinal' | 'comissaoFornecedora' | 'drop';
type SortDir = 'asc' | 'desc';

function SortIcon({ column, sortBy, sortDir }: { column: SortKey; sortBy: SortKey | null; sortDir: SortDir }) {
  if (sortBy !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
  return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
}

export default function Vendas() {
  const [, setTick] = useState(0);
  const reload = () => setTick(t => t + 1);

  const config = store.getConfig();
  const fornecedoras = store.getFornecedoras();
  const vendas = store.getVendas();
  const pecas = store.getPecas();

  const [dropFilter, setDropFilter] = useState<string>('all');
  const [fornFilter, setFornFilter] = useState<string>('all');
  const [pagoFilter, setPagoFilter] = useState<string>('all');
  const [busca, setBusca] = useState('');

  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [showNova, setShowNova] = useState(false);
  const [buscaPeca, setBuscaPeca] = useState('');
  const [pecaSelecionada, setPecaSelecionada] = useState<Peca | null>(null);
  const [vendaDesconto, setVendaDesconto] = useState('0');
  const [vendaPagamento, setVendaPagamento] = useState<string>('Pix');
  const [vendaCompradora, setVendaCompradora] = useState('');
  const [vendaEndereco, setVendaEndereco] = useState('');
  const [vendaDataEntrega, setVendaDataEntrega] = useState('');

  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);
  const [editCompradora, setEditCompradora] = useState('');
  const [editEndereco, setEditEndereco] = useState('');
  const [editDataEntrega, setEditDataEntrega] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Venda | null>(null);

  const drops = useMemo(() => {
    const s = new Set<number>();
    vendas.forEach(v => s.add(v.drop));
    return Array.from(s).sort((a, b) => a - b);
  }, [vendas]);

  const dropCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    drops.forEach(d => { counts[d] = vendas.filter(v => v.drop === d).length; });
    return counts;
  }, [vendas, drops]);

  const filtered = useMemo(() => {
    let result = vendas.filter(v => {
      if (dropFilter !== 'all' && v.drop !== Number(dropFilter)) return false;
      if (fornFilter !== 'all' && v.fornecedoraId !== fornFilter) return false;
      if (pagoFilter === 'pago' && !v.pagoFornecedora) return false;
      if (pagoFilter === 'pendente' && v.pagoFornecedora) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (!v.descricaoPeca.toLowerCase().includes(q) && !String(v.skuPeca).includes(q) && !v.compradora.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    if (sortBy) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'skuPeca' || sortBy === 'precoFinal' || sortBy === 'comissaoFornecedora' || sortBy === 'drop') {
          cmp = (a[sortBy] as number) - (b[sortBy] as number);
        } else {
          cmp = String(a[sortBy]).localeCompare(String(b[sortBy]), 'pt-BR');
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
    } else {
      result = [...result].sort((a, b) => b.dataVenda.localeCompare(a.dataVenda));
    }
    return result;
  }, [vendas, dropFilter, fornFilter, pagoFilter, busca, sortBy, sortDir]);

  const totalFaturamento = filtered.reduce((s, v) => s + v.precoFinal, 0);
  const totalComissao = filtered.reduce((s, v) => s + v.comissaoFornecedora, 0);
  const totalBrecho = filtered.reduce((s, v) => s + v.parcelaBrecho, 0);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
  };

  const pecasDisponiveis = pecas.filter(p => p.status === 'Disponível').filter(p => {
    if (!buscaPeca) return true;
    const q = buscaPeca.toLowerCase();
    return p.descricao.toLowerCase().includes(q) || String(p.sku).includes(q);
  });

  const getFornNome = (id: string) => fornecedoras.find(f => f.id === id)?.nome || '—';

  const handleVenda = () => {
    if (!pecaSelecionada) return;
    const desconto = parseFloat(vendaDesconto) || 0;
    const precoFinal = pecaSelecionada.preco - desconto;
    if (precoFinal < 0) { toast.error('Desconto não pode ser maior que o preço!'); return; }

    const pagamento = vendaPagamento as MeioPagamento;
    const base = pagamento === 'Cartão Crédito' ? precoFinal * (1 - config.taxaCartao) : precoFinal;

    const venda: Venda = {
      id: crypto.randomUUID(), dataVenda: new Date().toISOString().split('T')[0],
      skuPeca: pecaSelecionada.sku, descricaoPeca: pecaSelecionada.descricao,
      fornecedoraId: pecaSelecionada.fornecedoraId, drop: pecaSelecionada.drop,
      desconto, precoFinal, pagamento,
      comissaoFornecedora: base * config.percentualFornecedora, parcelaBrecho: base * config.percentualBrecho,
      pagoFornecedora: false, dataPagamento: null,
      compradora: vendaCompradora, enderecoEntrega: vendaEndereco, dataEntrega: vendaDataEntrega || null,
    };

    store.setVendas([...vendas, venda]);
    store.setPecas(store.getPecas().map(p => p.sku === pecaSelecionada.sku ? { ...p, status: 'Vendido' as StatusPeca } : p));

    setShowNova(false);
    setPecaSelecionada(null); setBuscaPeca(''); setVendaDesconto('0'); setVendaCompradora(''); setVendaEndereco(''); setVendaDataEntrega('');
    toast.success(`Venda registrada: #${pecaSelecionada.sku}`);
    reload();
  };

  const togglePago = (vendaId: string) => {
    const all = store.getVendas().map(v => v.id === vendaId ? {
      ...v, pagoFornecedora: !v.pagoFornecedora,
      dataPagamento: !v.pagoFornecedora ? new Date().toISOString().split('T')[0] : null,
    } : v);
    store.setVendas(all);
    const venda = all.find(v => v.id === vendaId);
    toast.success(venda?.pagoFornecedora ? 'Marcado como pago' : 'Marcado como pendente');
    reload();
  };

  const openEdit = (v: Venda) => {
    setEditingVenda(v); setEditCompradora(v.compradora);
    setEditEndereco(v.enderecoEntrega); setEditDataEntrega(v.dataEntrega || '');
  };

  const handleEditSave = () => {
    if (!editingVenda) return;
    const all = store.getVendas().map(v => v.id === editingVenda.id ? {
      ...v, compradora: editCompradora, enderecoEntrega: editEndereco, dataEntrega: editDataEntrega || null,
    } : v);
    store.setVendas(all);
    setEditingVenda(null);
    toast.success('Venda atualizada');
    reload();
  };

  const handleDelete = (venda: Venda) => {
    store.setVendas(store.getVendas().filter(v => v.id !== venda.id));
    store.setPecas(store.getPecas().map(p => p.sku === venda.skuPeca ? { ...p, status: 'Disponível' as StatusPeca } : p));
    setShowDeleteConfirm(null);
    toast.success(`Venda excluída, peça #${venda.skuPeca} voltou a "Disponível"`);
    reload();
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'SKU', 'Descrição', 'Fornecedora', 'DROP', 'Desconto', 'Preço Final', 'Pagamento', 'Com. Forn.', 'P. Brechó', 'Pago?', 'Compradora'];
    const rows = filtered.map(v => [v.dataVenda, v.skuPeca, v.descricaoPeca, getFornNome(v.fornecedoraId), v.drop, v.desconto, v.precoFinal, v.pagamento, v.comissaoFornecedora.toFixed(2), v.parcelaBrecho.toFixed(2), v.pagoFornecedora ? 'Sim' : 'Não', v.compradora]);
    exportCSV('vendas.csv', headers, rows);
    toast.success('CSV exportado');
  };

  const vendaPrecoFinal = pecaSelecionada ? pecaSelecionada.preco - (parseFloat(vendaDesconto) || 0) : 0;
  const vendaBase = pecaSelecionada && vendaPagamento === 'Cartão Crédito' ? vendaPrecoFinal * (1 - config.taxaCartao) : vendaPrecoFinal;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filter bar */}
      <div className="filter-bar flex flex-wrap gap-4 items-end">
        <div>
          <Label className="label-upper">Drop</Label>
          <Select value={dropFilter} onValueChange={setDropFilter}>
            <SelectTrigger className="w-32 rounded-full bg-muted/50 border-0 mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {drops.map(d => <SelectItem key={d} value={String(d)}>Drop {d} ({dropCounts[d]})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="label-upper">Fornecedora</Label>
          <Select value={fornFilter} onValueChange={setFornFilter}>
            <SelectTrigger className="w-36 rounded-full bg-muted/50 border-0 mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {fornecedoras.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="label-upper">Pagamento Forn.</Label>
          <Select value={pagoFilter} onValueChange={setPagoFilter}>
            <SelectTrigger className="w-36 rounded-full bg-muted/50 border-0 mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos ({vendas.length})</SelectItem>
              <SelectItem value="pago">Pago ({vendas.filter(v => v.pagoFornecedora).length})</SelectItem>
              <SelectItem value="pendente">Pendente ({vendas.filter(v => !v.pagoFornecedora).length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <Label className="label-upper">Buscar</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 rounded-full bg-muted/50 border-0" placeholder="SKU, descrição ou compradora..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
        </div>
        <Button variant="outline" onClick={handleExportCSV} className="shrink-0 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300">
          <Download className="h-4 w-4 mr-1" /> CSV
        </Button>
        <Button onClick={() => setShowNova(true)} className="shrink-0 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg transition-all duration-300">
          <Plus className="h-4 w-4 mr-1" /> Nova Venda
        </Button>
      </div>

      {/* Table */}
      <Card className="card-modern overflow-hidden border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-premium">
              <thead>
                <tr>
                  <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('dataVenda')}>
                    <span className="flex items-center">Data <SortIcon column="dataVenda" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('skuPeca')}>
                    <span className="flex items-center">SKU <SortIcon column="skuPeca" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('descricaoPeca')}>
                    <span className="flex items-center">Descrição <SortIcon column="descricaoPeca" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="text-left">Fornecedora</th>
                  <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('drop')}>
                    <span className="flex items-center">Drop <SortIcon column="drop" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="text-left">Desc.</th>
                  <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('precoFinal')}>
                    <span className="flex items-center">Preço Final <SortIcon column="precoFinal" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="text-left">Pgto</th>
                  <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('comissaoFornecedora')}>
                    <span className="flex items-center">Com. Forn. <SortIcon column="comissaoFornecedora" sortBy={sortBy} sortDir={sortDir} /></span>
                  </th>
                  <th className="text-left">P. Brechó</th>
                  <th className="text-left">Pago?</th>
                  <th className="text-left">Compradora</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="text-xs text-muted-foreground">{v.dataVenda}</td>
                    <td className="font-mono text-xs text-muted-foreground">#{v.skuPeca}</td>
                    <td className="font-medium">{v.descricaoPeca}</td>
                    <td className="text-muted-foreground">{getFornNome(v.fornecedoraId)}</td>
                    <td><span className="pill-badge bg-muted text-foreground">{v.drop}</span></td>
                    <td className="text-muted-foreground">{v.desconto > 0 ? fmt(v.desconto) : '—'}</td>
                    <td className="font-mono-price text-primary">{fmt(v.precoFinal)}</td>
                    <td><span className="pill-badge bg-muted text-foreground">{v.pagamento}</span></td>
                    <td className="font-mono-price text-muted-foreground">{fmt(v.comissaoFornecedora)}</td>
                    <td className="font-mono-price text-muted-foreground">{fmt(v.parcelaBrecho)}</td>
                    <td>
                      <Checkbox checked={v.pagoFornecedora} onCheckedChange={() => togglePago(v.id)} />
                    </td>
                    <td className="text-muted-foreground">{v.compradora || '—'}</td>
                    <td>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => openEdit(v)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive" onClick={() => setShowDeleteConfirm(v)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={13} className="p-0">
                      <div className="empty-state">
                        <Receipt className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-xl font-heading">Nenhuma venda encontrada</p>
                        <p className="text-sm mt-1">Tente ajustar os filtros ou registre uma nova</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="border-t bg-primary/5 font-semibold">
                    <td className="py-4 px-4" colSpan={6}>
                      <span className="text-muted-foreground">{filtered.length} vendas</span>
                    </td>
                    <td className="py-4 px-4 font-mono-price text-primary">{fmt(totalFaturamento)}</td>
                    <td className="py-4 px-4"></td>
                    <td className="py-4 px-4 font-mono-price">{fmt(totalComissao)}</td>
                    <td className="py-4 px-4 font-mono-price">{fmt(totalBrecho)}</td>
                    <td className="py-4 px-4" colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Nova Venda Dialog */}
      <Dialog open={showNova} onOpenChange={setShowNova}>
        <DialogContent className="max-w-lg overflow-hidden rounded-3xl">
          <DialogHeader className="bg-primary -mx-6 -mt-6 px-6 pt-6 pb-4 mb-2">
            <DialogTitle className="font-heading text-lg text-primary-foreground">Nova Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {!pecaSelecionada ? (
              <div>
                <Label className="label-upper">Buscar Peça (SKU ou nome)</Label>
                <Input value={buscaPeca} onChange={e => setBuscaPeca(e.target.value)} placeholder="Digite para buscar..." className="mt-1.5 rounded-xl" />
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {pecasDisponiveis.slice(0, 10).map(p => (
                    <button key={p.sku} onClick={() => setPecaSelecionada(p)}
                      className="w-full text-left p-3 rounded-2xl hover:bg-muted/50 text-sm transition-colors">
                      <span className="font-mono text-xs text-muted-foreground">#{p.sku}</span> — {p.descricao} — <span className="font-mono-price">{fmt(p.preco)}</span>
                    </button>
                  ))}
                  {pecasDisponiveis.length === 0 && <p className="text-sm text-muted-foreground p-2">Nenhuma peça disponível</p>}
                </div>
              </div>
            ) : (
              <>
                <div className="bg-muted/40 p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="font-medium">#{pecaSelecionada.sku} — {pecaSelecionada.descricao}</p>
                    <p className="text-sm text-muted-foreground">{getFornNome(pecaSelecionada.fornecedoraId)} • {fmt(pecaSelecionada.preco)}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setPecaSelecionada(null)} className="rounded-full">Trocar</Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="label-upper">Desconto (R$)</Label><Input type="number" step="0.01" value={vendaDesconto} onChange={e => setVendaDesconto(e.target.value)} className="mt-1.5 rounded-xl" /></div>
                  <div><Label className="label-upper">Pagamento</Label>
                    <Select value={vendaPagamento} onValueChange={setVendaPagamento}>
                      <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {config.meiosPagamento.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="bg-accent/10 p-5 rounded-2xl text-sm space-y-2 border border-accent/20">
                  <p>Preço Final: <strong className="font-mono-price text-primary">{fmt(vendaPrecoFinal)}</strong></p>
                  {vendaPagamento === 'Cartão Crédito' && <p className="text-xs text-muted-foreground">Taxa 5% → Base: {fmt(vendaBase)}</p>}
                  <p>Comissão Forn.: <strong className="font-mono-price">{fmt(vendaBase * config.percentualFornecedora)}</strong></p>
                  <p>Parcela Brechó: <strong className="font-mono-price">{fmt(vendaBase * config.percentualBrecho)}</strong></p>
                  {vendaPrecoFinal < 0 && <p className="text-destructive font-semibold">⚠️ Desconto maior que o preço!</p>}
                </div>
                <div><Label className="label-upper">Compradora</Label><Input value={vendaCompradora} onChange={e => setVendaCompradora(e.target.value)} className="mt-1.5 rounded-xl" /></div>
                <div><Label className="label-upper">Endereço de Entrega</Label><Input value={vendaEndereco} onChange={e => setVendaEndereco(e.target.value)} className="mt-1.5 rounded-xl" /></div>
                <div><Label className="label-upper">Data de Entrega</Label><Input type="date" value={vendaDataEntrega} onChange={e => setVendaDataEntrega(e.target.value)} className="mt-1.5 rounded-xl" /></div>
              </>
            )}
          </div>
          <DialogFooter className="mt-5">
            <Button variant="outline" onClick={() => { setShowNova(false); setPecaSelecionada(null); }} className="rounded-full">Cancelar</Button>
            <Button onClick={handleVenda} disabled={!pecaSelecionada || vendaPrecoFinal < 0} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">Confirmar Venda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Venda Dialog */}
      <Dialog open={!!editingVenda} onOpenChange={() => setEditingVenda(null)}>
        <DialogContent className="max-w-md overflow-hidden rounded-3xl">
          <DialogHeader className="bg-primary -mx-6 -mt-6 px-6 pt-6 pb-4 mb-2">
            <DialogTitle className="font-heading text-lg text-primary-foreground">Editar Venda</DialogTitle>
          </DialogHeader>
          {editingVenda && (
            <div className="space-y-5">
              <div className="bg-muted/40 p-4 rounded-2xl">
                <p className="font-medium">#{editingVenda.skuPeca} — {editingVenda.descricaoPeca}</p>
                <p className="text-sm text-muted-foreground">{fmt(editingVenda.precoFinal)} • {editingVenda.pagamento}</p>
              </div>
              <div><Label className="label-upper">Compradora</Label><Input value={editCompradora} onChange={e => setEditCompradora(e.target.value)} className="mt-1.5 rounded-xl" /></div>
              <div><Label className="label-upper">Endereço de Entrega</Label><Input value={editEndereco} onChange={e => setEditEndereco(e.target.value)} className="mt-1.5 rounded-xl" /></div>
              <div><Label className="label-upper">Data de Entrega</Label><Input type="date" value={editDataEntrega} onChange={e => setEditDataEntrega(e.target.value)} className="mt-1.5 rounded-xl" /></div>
            </div>
          )}
          <DialogFooter className="mt-5">
            <Button variant="outline" onClick={() => setEditingVenda(null)} className="rounded-full">Cancelar</Button>
            <Button onClick={handleEditSave} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Excluir Venda</DialogTitle>
            <DialogDescription>
              Excluir a venda de #{showDeleteConfirm?.skuPeca} — {showDeleteConfirm?.descricaoPeca}? A peça voltará ao status "Disponível".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="rounded-full">Cancelar</Button>
            <Button variant="destructive" onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)} className="rounded-full">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
