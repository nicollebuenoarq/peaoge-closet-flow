import { useState, useMemo } from 'react';
import { store } from '@/lib/store';
import { Peca, StatusPeca, MeioPagamento, Venda } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, Search, ShoppingCart } from 'lucide-react';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const statusColors: Record<StatusPeca, string> = {
  'Disponível': 'bg-status-available/15 text-status-available border-status-available/30',
  'Vendido': 'bg-status-sold/15 text-status-sold border-status-sold/30',
  'Reservado': 'bg-status-reserved/15 text-status-reserved border-status-reserved/30',
  'Devolvido': 'bg-status-returned/15 text-status-returned border-status-returned/30',
};

export default function Catalogo() {
  const [, setTick] = useState(0);
  const reload = () => setTick(t => t + 1);

  const config = store.getConfig();
  const fornecedoras = store.getFornecedoras();
  const pecas = store.getPecas();

  const [dropFilter, setDropFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [catFilter, setCatFilter] = useState<string>('');
  const [fornFilter, setFornFilter] = useState<string>('all');
  const [busca, setBusca] = useState('');

  const [showNova, setShowNova] = useState(false);
  const [selectedPeca, setSelectedPeca] = useState<Peca | null>(null);
  const [showVenda, setShowVenda] = useState<Peca | null>(null);

  // Nova peça form
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novaTamanho, setNovaTamanho] = useState('');
  const [novaFornecedoraId, setNovaFornecedoraId] = useState('');
  const [novaPreco, setNovaPreco] = useState('');
  const [novaDrop, setNovaDrop] = useState(String(config.dropAtual));

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

  const filtered = pecas.filter(p => {
    if (dropFilter !== 'all' && p.drop !== Number(dropFilter)) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (fornFilter !== 'all' && p.fornecedoraId !== fornFilter) return false;
    if (catFilter && p.categoria !== catFilter) return false;
    if (busca) {
      const q = busca.toLowerCase();
      if (!p.descricao.toLowerCase().includes(q) && !String(p.sku).includes(q)) return false;
    }
    return true;
  });

  const handleNovaPeca = () => {
    const sku = store.getNextSku();
    const nova: Peca = {
      sku,
      descricao: novaDescricao,
      categoria: novaCategoria,
      tamanho: novaTamanho,
      fornecedoraId: novaFornecedoraId,
      dataEntrada: new Date().toISOString().split('T')[0],
      status: 'Disponível',
      preco: parseFloat(novaPreco) || 0,
      drop: parseInt(novaDrop) || config.dropAtual,
    };
    store.setPecas([...pecas, nova]);
    store.setNextSku(sku + 1);
    setShowNova(false);
    setNovaDescricao(''); setNovaCategoria(''); setNovaTamanho(''); setNovaFornecedoraId(''); setNovaPreco('');
    reload();
  };

  const handleVenda = () => {
    if (!showVenda) return;
    const peca = showVenda;
    const desconto = parseFloat(vendaDesconto) || 0;
    const precoFinal = peca.preco - desconto;
    const pagamento = vendaPagamento as MeioPagamento;
    const base = pagamento === 'Cartão Crédito' ? precoFinal * (1 - config.taxaCartao) : precoFinal;
    const comissaoFornecedora = base * config.percentualFornecedora;
    const parcelaBrecho = base * config.percentualBrecho;

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
      comissaoFornecedora,
      parcelaBrecho,
      pagoFornecedora: false,
      dataPagamento: null,
      compradora: vendaCompradora,
      enderecoEntrega: vendaEndereco,
      dataEntrega: vendaDataEntrega || null,
    };

    const vendas = store.getVendas();
    store.setVendas([...vendas, venda]);

    // Update piece status
    const allPecas = store.getPecas().map(p => p.sku === peca.sku ? { ...p, status: 'Vendido' as StatusPeca } : p);
    store.setPecas(allPecas);

    setShowVenda(null);
    setVendaDesconto('0'); setVendaCompradora(''); setVendaEndereco(''); setVendaDataEntrega('');
    reload();
  };

  const handleStatusChange = (sku: number, status: StatusPeca) => {
    const all = store.getPecas().map(p => p.sku === sku ? { ...p, status } : p);
    store.setPecas(all);
    setSelectedPeca(prev => prev ? { ...prev, status } : null);
    reload();
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
            <SelectTrigger className="w-28 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {drops.map(d => <SelectItem key={d} value={String(d)}>Drop {d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {config.statusValidos.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                <SelectItem value="">Todas</SelectItem>
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
        <Button onClick={() => setShowNova(true)} className="shrink-0">
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
                  <th className="p-3">SKU</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Tam.</th>
                  <th className="p-3">Fornecedora</th>
                  <th className="p-3">Entrada</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3">DROP</th>
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
                      {p.status === 'Disponível' && (
                        <Button size="sm" variant="secondary" onClick={() => { setShowVenda(p); setVendaDesconto('0'); setVendaPagamento('Pix'); }}>
                          <ShoppingCart className="h-3 w-3 mr-1" /> Vender
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">Nenhuma peça encontrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Nova Peça Dialog */}
      <Dialog open={showNova} onOpenChange={setShowNova}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading">Nova Peça</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Descrição</Label><Input value={novaDescricao} onChange={e => setNovaDescricao(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Categoria</Label><Input value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} /></div>
              <div><Label>Tamanho</Label><Input value={novaTamanho} onChange={e => setNovaTamanho(e.target.value)} /></div>
            </div>
            <div>
              <Label>Fornecedora</Label>
              <Select value={novaFornecedoraId} onValueChange={setNovaFornecedoraId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {fornecedoras.filter(f => f.ativa).map(f => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={novaPreco} onChange={e => setNovaPreco(e.target.value)} /></div>
              <div><Label>DROP</Label><Input type="number" value={novaDrop} onChange={e => setNovaDrop(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNova(false)}>Cancelar</Button>
            <Button onClick={handleNovaPeca} disabled={!novaDescricao || !novaFornecedoraId || !novaPreco}>Salvar</Button>
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
                {selectedPeca.status === 'Disponível' && (
                  <Button className="w-full" onClick={() => { setShowVenda(selectedPeca); setSelectedPeca(null); setVendaDesconto('0'); setVendaPagamento('Pix'); }}>
                    <ShoppingCart className="h-4 w-4 mr-2" /> Registrar Venda
                  </Button>
                )}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Comissão Fornecedora: {fmt(selectedPeca.preco * config.percentualFornecedora)}</p>
                  <p className="text-xs text-muted-foreground">Parcela Brechó: {fmt(selectedPeca.preco * config.percentualBrecho)}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

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
              </div>
              <div><Label>Compradora</Label><Input value={vendaCompradora} onChange={e => setVendaCompradora(e.target.value)} /></div>
              <div><Label>Endereço de Entrega</Label><Input value={vendaEndereco} onChange={e => setVendaEndereco(e.target.value)} /></div>
              <div><Label>Data de Entrega</Label><Input type="date" value={vendaDataEntrega} onChange={e => setVendaDataEntrega(e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVenda(null)}>Cancelar</Button>
            <Button onClick={handleVenda}>Confirmar Venda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
