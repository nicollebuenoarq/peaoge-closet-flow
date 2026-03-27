import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabaseStore } from '@/lib/supabaseStore';
import type { Peca, StatusPeca, MeioPagamento, Venda, AppConfig } from '@/types';
import { fmt } from '@/lib/fmt';
import { exportCSV } from '@/lib/csv';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, Search, ShoppingCart, Edit, Trash2, Download, ArrowUpDown, ArrowUp, ArrowDown, Package, CheckCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<StatusPeca, string> = {
  'Disponível': 'bg-status-available/15 text-status-available',
  'Vendido': 'bg-status-sold/15 text-status-sold',
  'Reservado': 'bg-status-reserved/15 text-status-reserved',
  'Devolvido': 'bg-status-returned/15 text-status-returned',
};

type SortKey = 'sku' | 'descricao' | 'categoria' | 'preco' | 'drop' | 'status' | 'dataEntrada';
type SortDir = 'asc' | 'desc';

function SortIcon({ column, sortBy, sortDir }: { column: SortKey; sortBy: SortKey | null; sortDir: SortDir }) {
  if (sortBy !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
  return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
}

const topBarColors = ['#2d4a2e', '#e8527a', '#f0a500'];
const iconBgs = ['bg-primary/10 text-primary', 'bg-accent/10 text-accent', 'bg-[#f0a500]/10 text-[#f0a500]'];

export default function Catalogo() {
  // ── Async data state ─────────────────────────────────────────────────────
  const DEFAULT_CONFIG: AppConfig = {
    percentualFornecedora: 0.60, percentualBrecho: 0.40, taxaCartao: 0.05, dropAtual: 2,
    statusValidos: ['Disponível', 'Vendido', 'Devolvido', 'Reservado'],
    meiosPagamento: ['Dinheiro', 'Pix', 'Cartão Crédito', 'Cartão Débito', 'Transferência'],
  };
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [fornecedoras, setFornecedoras] = useState<{ id: string; nome: string; ativa: boolean }[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [cfg, forn, pcs] = await Promise.all([
        supabaseStore.getConfig(),
        supabaseStore.getFornecedoras(),
        supabaseStore.getPecas(),
      ]);
      setConfig(cfg);
      setFornecedoras(forn);
      setPecas(pcs);
    } catch (err) {
      console.error('[Catalogo] Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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

  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [formDescricao, setFormDescricao] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formTamanho, setFormTamanho] = useState('');
  const [formFornecedoraId, setFormFornecedoraId] = useState('');
  const [formPreco, setFormPreco] = useState('');
  const [formDrop, setFormDrop] = useState(String(DEFAULT_CONFIG.dropAtual));

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

  const totalPreco = filtered.reduce((s, p) => s + p.preco, 0);
  const totalDisponivel = filtered.filter(p => p.status === 'Disponível').length;

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
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

  const handleSave = async () => {
    const preco = parseFloat(formPreco) || 0;
    if (preco <= 0 && !editingPeca) toast.warning('Atenção: peça cadastrada com preço R$ 0,00');
    try {
      if (editingPeca) {
        const updated: Peca = { ...editingPeca, descricao: formDescricao, categoria: formCategoria, tamanho: formTamanho, fornecedoraId: formFornecedoraId, preco, drop: parseInt(formDrop) || config.dropAtual };
        await supabaseStore.upsertPeca(updated);
        setSelectedPeca(prev => prev?.sku === editingPeca.sku ? updated : prev);
        toast.success(`Peça #${editingPeca.sku} atualizada`);
      } else {
        const sku = await supabaseStore.getNextSku();
        const nova: Peca = {
          sku, descricao: formDescricao, categoria: formCategoria, tamanho: formTamanho,
          fornecedoraId: formFornecedoraId, dataEntrada: new Date().toISOString().split('T')[0],
          status: 'Disponível', preco, drop: parseInt(formDrop) || config.dropAtual,
        };
        await supabaseStore.upsertPeca(nova);
        await supabaseStore.setNextSku(sku + 1);
        toast.success(`Peça #${sku} cadastrada`);
      }
      setShowForm(false);
      await loadData();
    } catch (err) { console.error(err); toast.error('Erro ao salvar peça'); }
  };

  const handleDelete = async (peca: Peca) => {
    try {
      await supabaseStore.deletePeca(peca.sku);
      const vendasPeca = await supabaseStore.getVendas();
      await Promise.all(vendasPeca.filter(v => v.skuPeca === peca.sku).map(v => supabaseStore.deleteVenda(v.id)));
      setShowDeleteConfirm(null); setSelectedPeca(null);
      toast.success(`Peça #${peca.sku} excluída`);
      await loadData();
    } catch (err) { console.error(err); toast.error('Erro ao excluir peça'); }
  };

  const handleStatusChange = (sku: number, newStatus: StatusPeca) => {
    const peca = pecas.find(p => p.sku === sku);
    if (peca && peca.status === 'Vendido' && newStatus !== 'Vendido') {
      setShowStatusWarning({ peca, newStatus }); return;
    }
    applyStatusChange(sku, newStatus);
  };

  const applyStatusChange = async (sku: number, status: StatusPeca) => {
    try {
      const peca = pecas.find(p => p.sku === sku);
      if (!peca) return;
      await supabaseStore.upsertPeca({ ...peca, status });
      setSelectedPeca(prev => prev ? { ...prev, status } : null);
      setShowStatusWarning(null);
      toast.success(`Status alterado para "${status}"`);
      await loadData();
    } catch (err) { console.error(err); toast.error('Erro ao alterar status'); }
  };

  const handleVenda = async () => {
    if (!showVenda) return;
    const peca = showVenda;
    const desconto = parseFloat(vendaDesconto) || 0;
    const precoFinal = peca.preco - desconto;
    if (precoFinal < 0) { toast.error('Desconto não pode ser maior que o preço!'); return; }
    try {
      const pagamento = vendaPagamento as MeioPagamento;
      const base = pagamento === 'Cartão Crédito' ? precoFinal * (1 - config.taxaCartao) : precoFinal;
      const venda: Venda = {
        id: crypto.randomUUID(), dataVenda: new Date().toISOString().split('T')[0],
        skuPeca: peca.sku, descricaoPeca: peca.descricao, fornecedoraId: peca.fornecedoraId, drop: peca.drop,
        desconto, precoFinal, pagamento,
        comissaoFornecedora: base * config.percentualFornecedora, parcelaBrecho: base * config.percentualBrecho,
        pagoFornecedora: false, dataPagamento: null,
        compradora: vendaCompradora, enderecoEntrega: vendaEndereco, dataEntrega: vendaDataEntrega || null,
      };
      await supabaseStore.upsertVenda(venda);
      await supabaseStore.upsertPeca({ ...peca, status: 'Vendido' as StatusPeca });
      setShowVenda(null);
      setVendaDesconto('0'); setVendaCompradora(''); setVendaEndereco(''); setVendaDataEntrega('');
      toast.success(`Venda registrada: #${peca.sku}`);
      await loadData();
    } catch (err) { console.error(err); toast.error('Erro ao registrar venda'); }
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

  const summaryCards = [
    { label: 'TOTAL DE PEÇAS', value: String(filtered.length), icon: Package, colorIdx: 0 },
    { label: 'DISPONÍVEIS', value: String(totalDisponivel), icon: CheckCircle, colorIdx: 1 },
    { label: 'VALOR TOTAL', value: fmt(totalPreco), icon: DollarSign, colorIdx: 2 },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-muted-foreground text-sm animate-pulse">Carregando catálogo...</p>
    </div>
  );
  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="font-display text-2xl sm:text-4xl md:text-5xl text-primary tracking-wide">CATÁLOGO</h1>

      {/* Summary mini-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 animate-stagger">
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
      <div className="filter-bar flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-end">
        <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4">
          <div>
            <Label className="label-upper">Drop</Label>
            <Select value={dropFilter} onValueChange={setDropFilter}>
              <SelectTrigger className="w-full sm:w-32 rounded-full bg-muted/50 border-0 mt-1 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {drops.map(d => <SelectItem key={d} value={String(d)}>Drop {d} ({dropCounts[d]})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="label-upper">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 rounded-full bg-muted/50 border-0 mt-1 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({pecas.length})</SelectItem>
                {config.statusValidos.map(s => <SelectItem key={s} value={s}>{s} ({statusCounts[s] || 0})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4">
          <div>
            <Label className="label-upper">Fornecedora</Label>
            <Select value={fornFilter} onValueChange={setFornFilter}>
              <SelectTrigger className="w-full sm:w-36 rounded-full bg-muted/50 border-0 mt-1 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {fornecedoras.map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {categorias.length > 0 && (
            <div>
              <Label className="label-upper">Categoria</Label>
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="w-full sm:w-32 rounded-full bg-muted/50 border-0 mt-1 text-sm"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 sm:min-w-[180px]">
          <Label className="label-upper">Buscar</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 rounded-full bg-muted/50 border-0 text-sm" placeholder="SKU ou descrição..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 sm:contents">
          <Button variant="outline" onClick={handleExportCSV} className="flex-1 sm:flex-initial shrink-0 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-xs">
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button onClick={openNew} className="flex-1 sm:flex-initial shrink-0 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs">
            <Plus className="h-4 w-4 mr-1" /> NOVA PEÇA
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="card-editorial overflow-hidden hidden md:block">
          <table className="w-full text-sm table-editorial">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[22%]" />
              <col className="w-[12%]" />
              <col className="w-[6%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[9%]" />
              <col className="w-[5%]" />
              <col className="w-[4%]" />
            </colgroup>
            <thead>
              <tr>
                <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('sku')}>
                  <span className="flex items-center">SKU <SortIcon column="sku" sortBy={sortBy} sortDir={sortDir} /></span>
                </th>
                <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('descricao')}>
                  <span className="flex items-center">DESCRIÇÃO <SortIcon column="descricao" sortBy={sortBy} sortDir={sortDir} /></span>
                </th>
                <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('categoria')}>
                  <span className="flex items-center">CAT. <SortIcon column="categoria" sortBy={sortBy} sortDir={sortDir} /></span>
                </th>
                <th className="text-left">TAM.</th>
                <th className="text-left">FORN.</th>
                <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('dataEntrada')}>
                  <span className="flex items-center">ENTRADA <SortIcon column="dataEntrada" sortBy={sortBy} sortDir={sortDir} /></span>
                </th>
                <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('status')}>
                  <span className="flex items-center">STATUS <SortIcon column="status" sortBy={sortBy} sortDir={sortDir} /></span>
                </th>
                <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('preco')}>
                  <span className="flex items-center">PREÇO <SortIcon column="preco" sortBy={sortBy} sortDir={sortDir} /></span>
                </th>
                <th className="text-left cursor-pointer select-none" onClick={() => toggleSort('drop')}>
                  <span className="flex items-center">DROP <SortIcon column="drop" sortBy={sortBy} sortDir={sortDir} /></span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.sku} className="border-b last:border-0 cursor-pointer" onClick={() => setSelectedPeca(p)}>
                  <td className="font-mono-price text-xs text-muted-foreground">#{p.sku}</td>
                  <td className="font-medium text-sm truncate">{p.descricao}</td>
                  <td className="text-muted-foreground text-sm truncate">{p.categoria}</td>
                  <td className="text-muted-foreground text-sm">{p.tamanho}</td>
                  <td className="text-muted-foreground text-sm truncate">{getFornNome(p.fornecedoraId)}</td>
                  <td className="text-muted-foreground text-sm">{p.dataEntrada}</td>
                  <td>
                    <span className={`pill-badge ${statusColors[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="font-mono-price text-primary text-xs">{fmt(p.preco)}</td>
                  <td>
                    <span className="pill-badge bg-muted text-foreground">{p.drop}</span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => openEdit(p)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      {p.status === 'Disponível' && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-status-available/10 text-status-available" onClick={() => { setShowVenda(p); setVendaDesconto('0'); setVendaPagamento('Pix'); }}>
                          <ShoppingCart className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-0">
                    <div className="empty-state">
                      <Package className="h-16 w-16 mb-4 opacity-20" />
                      <p className="text-xl font-display">NENHUMA PEÇA ENCONTRADA</p>
                      <p className="text-sm mt-1">Tente ajustar os filtros ou cadastre uma nova</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t bg-primary text-white font-semibold">
                  <td className="py-4 px-4" colSpan={6}>
                    <span className="text-white/70 text-xs">{filtered.length} peças</span>
                    <span className="text-white/50 ml-2 text-xs">({totalDisponivel} disponíveis)</span>
                  </td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 font-mono-price text-white text-xs">{fmt(totalPreco)}</td>
                  <td className="py-4 px-4" colSpan={2}></td>
                </tr>
              </tfoot>
            )}
           </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="card-editorial empty-state py-12">
            <Package className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-xl font-display">NENHUMA PEÇA ENCONTRADA</p>
            <p className="text-sm mt-1">Tente ajustar os filtros ou cadastre uma nova</p>
          </div>
        )}
        {filtered.map(p => (
          <div
            key={p.sku}
            className="card-editorial p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setSelectedPeca(p)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono-price text-xs text-muted-foreground">#{p.sku}</span>
                  <span className={`pill-badge ${statusColors[p.status]} text-[10px]`}>{p.status}</span>
                  <span className="pill-badge bg-muted text-foreground text-[10px]">D{p.drop}</span>
                </div>
                <p className="font-medium text-sm truncate">{p.descricao}</p>
                <p className="text-xs text-muted-foreground truncate">{p.categoria} • {p.tamanho} • {getFornNome(p.fornecedoraId)}</p>
              </div>
              <p className="font-mono-price text-primary text-sm font-bold shrink-0">{fmt(p.preco)}</p>
            </div>
            <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
              <Button size="sm" variant="outline" className="flex-1 rounded-full text-xs h-8" onClick={() => openEdit(p)}>
                <Edit className="h-3 w-3 mr-1" /> Editar
              </Button>
              {p.status === 'Disponível' && (
                <Button size="sm" className="flex-1 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-8" onClick={() => { setShowVenda(p); setVendaDesconto('0'); setVendaPagamento('Pix'); }}>
                  <ShoppingCart className="h-3 w-3 mr-1" /> Vender
                </Button>
              )}
              <Button size="sm" variant="outline" className="rounded-full text-xs h-8 text-destructive hover:bg-destructive/10" onClick={() => setShowDeleteConfirm(p)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        {filtered.length > 0 && (
          <div className="bg-primary rounded-2xl p-4 flex items-center justify-between text-white">
            <span className="text-xs text-white/70">{filtered.length} peças ({totalDisponivel} disponíveis)</span>
            <span className="font-mono-price text-sm font-bold">{fmt(totalPreco)}</span>
          </div>
        )}
      </div>

      {/* Nova/Editar Peça Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md overflow-hidden rounded-2xl">
          <DialogHeader className="bg-primary -mx-6 -mt-6 px-6 pt-6 pb-4 mb-2">
            <DialogTitle className="font-display text-xl text-white tracking-wide">{editingPeca ? `EDITAR PEÇA #${editingPeca.sku}` : 'NOVA PEÇA'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div><Label className="label-upper">Descrição</Label><Input value={formDescricao} onChange={e => setFormDescricao(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="label-upper">Categoria</Label><Input value={formCategoria} onChange={e => setFormCategoria(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
              <div><Label className="label-upper">Tamanho</Label><Input value={formTamanho} onChange={e => setFormTamanho(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
            </div>
            <div>
              <Label className="label-upper">Fornecedora</Label>
              <Select value={formFornecedoraId} onValueChange={setFormFornecedoraId}>
                <SelectTrigger className="mt-1.5 rounded-xl text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {fornecedoras.filter(f => f.ativa).map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="label-upper">Preço (R$)</Label><Input type="number" step="0.01" value={formPreco} onChange={e => setFormPreco(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
              <div><Label className="label-upper">Drop</Label><Input type="number" value={formDrop} onChange={e => setFormDrop(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
            </div>
          </div>
          <DialogFooter className="mt-5">
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-full text-xs">Cancelar</Button>
            <Button onClick={handleSave} disabled={!formDescricao || !formFornecedoraId} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={!!selectedPeca} onOpenChange={() => setSelectedPeca(null)}>
        <SheetContent>
          {selectedPeca && (
            <>
              <SheetHeader className="pb-4 border-b">
                <SheetTitle className="font-display text-3xl tracking-wide">PEÇA #{selectedPeca.sku}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div><p className="label-upper">Descrição</p><p className="font-medium mt-1 text-sm">{selectedPeca.descricao}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="label-upper">Categoria</p><p className="mt-1 text-sm">{selectedPeca.categoria}</p></div>
                  <div><p className="label-upper">Tamanho</p><p className="mt-1 text-sm">{selectedPeca.tamanho}</p></div>
                </div>
                <div><p className="label-upper">Fornecedora</p><p className="mt-1 text-sm">{getFornNome(selectedPeca.fornecedoraId)}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/40">
                    <p className="label-upper">Preço</p>
                    <p className="font-display text-3xl text-primary mt-1">{fmt(selectedPeca.preco)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/40">
                    <p className="label-upper">Drop</p>
                    <p className="font-display text-3xl mt-1">{selectedPeca.drop}</p>
                  </div>
                </div>
                <div>
                  <p className="label-upper mb-2">Status</p>
                  <span className={`pill-badge ${statusColors[selectedPeca.status]} text-sm px-4 py-1.5`}>{selectedPeca.status}</span>
                </div>
                <div>
                  <Label className="label-upper">Alterar Status</Label>
                  <Select value={selectedPeca.status} onValueChange={(v) => handleStatusChange(selectedPeca.sku, v as StatusPeca)}>
                    <SelectTrigger className="mt-1.5 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {config.statusValidos.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  {selectedPeca.status === 'Disponível' && (
                    <Button className="flex-1 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs" onClick={() => { setShowVenda(selectedPeca); setSelectedPeca(null); setVendaDesconto('0'); setVendaPagamento('Pix'); }}>
                      <ShoppingCart className="h-4 w-4 mr-2" /> Vender
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1 rounded-full text-xs" onClick={() => { openEdit(selectedPeca); setSelectedPeca(null); }}>
                    <Edit className="h-4 w-4 mr-2" /> Editar
                  </Button>
                  <Button variant="destructive" size="icon" className="rounded-full" onClick={() => setShowDeleteConfirm(selectedPeca)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm text-muted-foreground">Comissão Fornecedora: <span className="font-mono-price text-foreground">{fmt(selectedPeca.preco * config.percentualFornecedora)}</span></p>
                  <p className="text-sm text-muted-foreground">Parcela Brechó: <span className="font-mono-price text-foreground">{fmt(selectedPeca.preco * config.percentualBrecho)}</span></p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirm */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">EXCLUIR PEÇA</DialogTitle>
            <DialogDescription className="text-sm">
              Tem certeza que deseja excluir a peça #{showDeleteConfirm?.sku} — {showDeleteConfirm?.descricao}? As vendas associadas também serão removidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="rounded-full text-xs">Cancelar</Button>
            <Button variant="destructive" onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)} className="rounded-full text-xs">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Warning */}
      <Dialog open={!!showStatusWarning} onOpenChange={() => setShowStatusWarning(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wide">ATENÇÃO</DialogTitle>
            <DialogDescription className="text-sm">
              Esta peça está marcada como "Vendido". Alterar o status pode desconectar da venda registrada. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusWarning(null)} className="rounded-full text-xs">Cancelar</Button>
            <Button onClick={() => showStatusWarning && applyStatusChange(showStatusWarning.peca.sku, showStatusWarning.newStatus)} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs">Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Venda Dialog */}
      <Dialog open={!!showVenda} onOpenChange={() => setShowVenda(null)}>
        <DialogContent className="max-w-md overflow-hidden rounded-2xl">
          <DialogHeader className="bg-primary -mx-6 -mt-6 px-6 pt-6 pb-4 mb-2">
            <DialogTitle className="font-display text-xl text-white tracking-wide">REGISTRAR VENDA</DialogTitle>
          </DialogHeader>
          {showVenda && (
            <div className="space-y-5">
              <div className="bg-muted/40 p-4 rounded-2xl">
                <p className="font-medium text-sm">#{showVenda.sku} — {showVenda.descricao}</p>
                <p className="text-sm text-muted-foreground">{getFornNome(showVenda.fornecedoraId)} • Drop {showVenda.drop} • {fmt(showVenda.preco)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="label-upper">Desconto (R$)</Label><Input type="number" step="0.01" value={vendaDesconto} onChange={e => setVendaDesconto(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
                <div><Label className="label-upper">Pagamento</Label>
                  <Select value={vendaPagamento} onValueChange={setVendaPagamento}>
                    <SelectTrigger className="mt-1.5 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {config.meiosPagamento.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="bg-accent/10 p-5 rounded-2xl text-sm space-y-2 border border-accent/20">
                <p>Preço Final: <strong className="font-mono-price text-primary">{fmt(vendaPrecoFinal)}</strong></p>
                {vendaPagamento === 'Cartão Crédito' && <p className="text-muted-foreground">Taxa 5% aplicada → Base: {fmt(vendaBase)}</p>}
                <p>Comissão Forn.: <strong className="font-mono-price">{fmt(vendaBase * config.percentualFornecedora)}</strong></p>
                <p>Parcela Brechó: <strong className="font-mono-price">{fmt(vendaBase * config.percentualBrecho)}</strong></p>
                {vendaPrecoFinal < 0 && <p className="text-destructive font-semibold">⚠️ Desconto maior que o preço!</p>}
              </div>
              <div><Label className="label-upper">Compradora</Label><Input value={vendaCompradora} onChange={e => setVendaCompradora(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
              <div><Label className="label-upper">Endereço de Entrega</Label><Input value={vendaEndereco} onChange={e => setVendaEndereco(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
              <div><Label className="label-upper">Data de Entrega</Label><Input type="date" value={vendaDataEntrega} onChange={e => setVendaDataEntrega(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
            </div>
          )}
          <DialogFooter className="mt-5">
            <Button variant="outline" onClick={() => setShowVenda(null)} className="rounded-full text-xs">Cancelar</Button>
            <Button onClick={handleVenda} disabled={!showVenda || vendaPrecoFinal < 0} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs">Confirmar Venda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
