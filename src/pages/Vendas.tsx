import { useState, useMemo } from 'react';
import { store } from '@/lib/store';
import { Venda, Peca, MeioPagamento, StatusPeca } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search } from 'lucide-react';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

  const [showNova, setShowNova] = useState(false);
  const [buscaPeca, setBuscaPeca] = useState('');
  const [pecaSelecionada, setPecaSelecionada] = useState<Peca | null>(null);
  const [vendaDesconto, setVendaDesconto] = useState('0');
  const [vendaPagamento, setVendaPagamento] = useState<string>('Pix');
  const [vendaCompradora, setVendaCompradora] = useState('');
  const [vendaEndereco, setVendaEndereco] = useState('');
  const [vendaDataEntrega, setVendaDataEntrega] = useState('');

  const drops = useMemo(() => {
    const s = new Set<number>();
    vendas.forEach(v => s.add(v.drop));
    return Array.from(s).sort((a, b) => a - b);
  }, [vendas]);

  const filtered = vendas.filter(v => {
    if (dropFilter !== 'all' && v.drop !== Number(dropFilter)) return false;
    if (fornFilter !== 'all' && v.fornecedoraId !== fornFilter) return false;
    if (pagoFilter === 'pago' && !v.pagoFornecedora) return false;
    if (pagoFilter === 'pendente' && v.pagoFornecedora) return false;
    if (busca) {
      const q = busca.toLowerCase();
      if (!v.descricaoPeca.toLowerCase().includes(q) && !String(v.skuPeca).includes(q) && !v.compradora.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.dataVenda.localeCompare(a.dataVenda));

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
    const pagamento = vendaPagamento as MeioPagamento;
    const base = pagamento === 'Cartão Crédito' ? precoFinal * (1 - config.taxaCartao) : precoFinal;

    const venda: Venda = {
      id: crypto.randomUUID(),
      dataVenda: new Date().toISOString().split('T')[0],
      skuPeca: pecaSelecionada.sku,
      descricaoPeca: pecaSelecionada.descricao,
      fornecedoraId: pecaSelecionada.fornecedoraId,
      drop: pecaSelecionada.drop,
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

    store.setVendas([...vendas, venda]);
    const allPecas = store.getPecas().map(p => p.sku === pecaSelecionada.sku ? { ...p, status: 'Vendido' as StatusPeca } : p);
    store.setPecas(allPecas);

    setShowNova(false);
    setPecaSelecionada(null); setBuscaPeca(''); setVendaDesconto('0'); setVendaCompradora(''); setVendaEndereco(''); setVendaDataEntrega('');
    reload();
  };

  const togglePago = (vendaId: string) => {
    const all = store.getVendas().map(v => v.id === vendaId ? {
      ...v,
      pagoFornecedora: !v.pagoFornecedora,
      dataPagamento: !v.pagoFornecedora ? new Date().toISOString().split('T')[0] : null,
    } : v);
    store.setVendas(all);
    reload();
  };

  const vendaPrecoFinal = pecaSelecionada ? pecaSelecionada.preco - (parseFloat(vendaDesconto) || 0) : 0;
  const vendaBase = pecaSelecionada && vendaPagamento === 'Cartão Crédito' ? vendaPrecoFinal * (1 - config.taxaCartao) : vendaPrecoFinal;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label className="text-xs">DROP</Label>
          <Select value={dropFilter} onValueChange={setDropFilter}>
            <SelectTrigger className="w-28 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {drops.map(d => <SelectItem key={d} value={String(d)}>Drop {d}</SelectItem>)}
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
        <div>
          <Label className="text-xs">Pagamento Forn.</Label>
          <Select value={pagoFilter} onValueChange={setPagoFilter}>
            <SelectTrigger className="w-32 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <Label className="text-xs">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 bg-card" placeholder="SKU, descrição ou compradora..." value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
        </div>
        <Button onClick={() => setShowNova(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Nova Venda
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground bg-muted/30">
                  <th className="p-3">Data</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Fornecedora</th>
                  <th className="p-3">DROP</th>
                  <th className="p-3">Desc.</th>
                  <th className="p-3">Preço Final</th>
                  <th className="p-3">Pgto</th>
                  <th className="p-3">Com. Forn.</th>
                  <th className="p-3">P. Brechó</th>
                  <th className="p-3">Pago?</th>
                  <th className="p-3">Compradora</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-3 text-xs">{v.dataVenda}</td>
                    <td className="p-3 font-mono text-xs">#{v.skuPeca}</td>
                    <td className="p-3">{v.descricaoPeca}</td>
                    <td className="p-3">{getFornNome(v.fornecedoraId)}</td>
                    <td className="p-3">{v.drop}</td>
                    <td className="p-3">{v.desconto > 0 ? fmt(v.desconto) : '—'}</td>
                    <td className="p-3 font-semibold">{fmt(v.precoFinal)}</td>
                    <td className="p-3"><Badge variant="outline" className="text-xs">{v.pagamento}</Badge></td>
                    <td className="p-3">{fmt(v.comissaoFornecedora)}</td>
                    <td className="p-3">{fmt(v.parcelaBrecho)}</td>
                    <td className="p-3">
                      <Checkbox checked={v.pagoFornecedora} onCheckedChange={() => togglePago(v.id)} />
                    </td>
                    <td className="p-3">{v.compradora || '—'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={12} className="p-8 text-center text-muted-foreground">Nenhuma venda encontrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Nova Venda Dialog */}
      <Dialog open={showNova} onOpenChange={setShowNova}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">Nova Venda</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {!pecaSelecionada ? (
              <div>
                <Label>Buscar Peça (SKU ou nome)</Label>
                <Input value={buscaPeca} onChange={e => setBuscaPeca(e.target.value)} placeholder="Digite para buscar..." />
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {pecasDisponiveis.slice(0, 10).map(p => (
                    <button
                      key={p.sku}
                      onClick={() => setPecaSelecionada(p)}
                      className="w-full text-left p-2 rounded-md hover:bg-muted/50 text-sm"
                    >
                      <span className="font-mono">#{p.sku}</span> — {p.descricao} — {fmt(p.preco)}
                    </button>
                  ))}
                  {pecasDisponiveis.length === 0 && <p className="text-sm text-muted-foreground p-2">Nenhuma peça disponível</p>}
                </div>
              </div>
            ) : (
              <>
                <div className="bg-muted/30 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">#{pecaSelecionada.sku} — {pecaSelecionada.descricao}</p>
                    <p className="text-sm text-muted-foreground">{getFornNome(pecaSelecionada.fornecedoraId)} • {fmt(pecaSelecionada.preco)}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setPecaSelecionada(null)}>Trocar</Button>
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
                  {vendaPagamento === 'Cartão Crédito' && <p className="text-xs text-muted-foreground">Taxa 5% → Base: {fmt(vendaBase)}</p>}
                  <p>Comissão Forn.: <strong>{fmt(vendaBase * config.percentualFornecedora)}</strong></p>
                  <p>Parcela Brechó: <strong>{fmt(vendaBase * config.percentualBrecho)}</strong></p>
                </div>
                <div><Label>Compradora</Label><Input value={vendaCompradora} onChange={e => setVendaCompradora(e.target.value)} /></div>
                <div><Label>Endereço de Entrega</Label><Input value={vendaEndereco} onChange={e => setVendaEndereco(e.target.value)} /></div>
                <div><Label>Data de Entrega</Label><Input type="date" value={vendaDataEntrega} onChange={e => setVendaDataEntrega(e.target.value)} /></div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNova(false); setPecaSelecionada(null); }}>Cancelar</Button>
            <Button onClick={handleVenda} disabled={!pecaSelecionada}>Confirmar Venda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
