import { useMemo, useState } from 'react';
import { store } from '@/lib/store';
import { fmt } from '@/lib/fmt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Users, Package, Wallet, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const iconColors = [
  'bg-primary/10 text-primary',
  'bg-accent/10 text-accent',
  'bg-primary/10 text-primary',
  'bg-status-available/10 text-status-available',
  'bg-destructive/10 text-destructive',
];

export default function Dashboard() {
  const [, setTick] = useState(0);
  const reload = () => setTick(t => t + 1);

  const [dropFilter, setDropFilter] = useState<string>('all');
  const config = store.getConfig();
  const fornecedoras = store.getFornecedoras();
  const pecas = store.getPecas();
  const vendas = store.getVendas();

  const drops = useMemo(() => {
    const s = new Set<number>();
    pecas.forEach(p => s.add(p.drop));
    vendas.forEach(v => s.add(v.drop));
    return Array.from(s).sort((a, b) => a - b);
  }, [pecas, vendas]);

  const filteredVendas = dropFilter === 'all' ? vendas : vendas.filter(v => v.drop === Number(dropFilter));
  const filteredPecas = dropFilter === 'all' ? pecas : pecas.filter(p => p.drop === Number(dropFilter));
  const disponíveis = filteredPecas.filter(p => p.status === 'Disponível');

  const faturamento = filteredVendas.reduce((s, v) => s + v.precoFinal, 0);
  const comissaoTotal = filteredVendas.reduce((s, v) => s + v.comissaoFornecedora, 0);
  const parcelaBrecho = filteredVendas.reduce((s, v) => s + v.parcelaBrecho, 0);
  const totalPago = filteredVendas.filter(v => v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);
  const saldoPagar = comissaoTotal - totalPago;

  const prevFaturamento = disponíveis.reduce((s, p) => s + p.preco, 0);
  const prevComissao = prevFaturamento * config.percentualFornecedora;
  const prevParcelaBrecho = prevFaturamento * config.percentualBrecho;

  const socias = fornecedoras.filter(f => f.ehSocia);
  const parcelaSocia = parcelaBrecho / (socias.length || 1);

  const repasses = fornecedoras.map(f => {
    const vendasF = filteredVendas.filter(v => v.fornecedoraId === f.id);
    const comissaoDevida = vendasF.reduce((s, v) => s + v.comissaoFornecedora, 0);
    const pago = vendasF.filter(v => v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);
    const parteBrechoSocia = f.ehSocia ? parcelaSocia : 0;
    const totalReceber = comissaoDevida + parteBrechoSocia;
    const pendente = comissaoDevida - pago;
    const vendasPendentes = vendasF.filter(v => !v.pagoFornecedora).length;
    return { ...f, comissaoDevida, parteBrechoSocia, totalReceber, pago, pendente, vendasCount: vendasF.length, vendasPendentes };
  }).filter(r => r.vendasCount > 0 || r.parteBrechoSocia > 0);

  const previsaoForn = fornecedoras.map(f => {
    const pecasF = disponíveis.filter(p => p.fornecedoraId === f.id);
    const prevComF = pecasF.reduce((s, p) => s + p.preco, 0) * config.percentualFornecedora;
    const prevBrechoF = pecasF.reduce((s, p) => s + p.preco, 0) * config.percentualBrecho;
    return { ...f, qtd: pecasF.length, prevComissao: prevComF, prevBrecho: prevBrechoF, prevTotal: prevComF + (f.ehSocia ? prevBrechoF / (socias.length || 1) : 0) };
  }).filter(r => r.qtd > 0);

  const handlePagarTudo = (fornecedoraId: string) => {
    const allVendas = store.getVendas().map(v =>
      v.fornecedoraId === fornecedoraId && !v.pagoFornecedora && (dropFilter === 'all' || v.drop === Number(dropFilter))
        ? { ...v, pagoFornecedora: true, dataPagamento: new Date().toISOString().split('T')[0] }
        : v
    );
    store.setVendas(allVendas);
    const forn = fornecedoras.find(f => f.id === fornecedoraId);
    toast.success(`Todas as vendas de ${forn?.nome} marcadas como pagas`);
    reload();
  };

  const indicators = [
    { label: 'Faturamento Bruto', value: fmt(faturamento), icon: DollarSign, colorIdx: 0 },
    { label: 'Comissão Fornecedoras', value: fmt(comissaoTotal), icon: Users, colorIdx: 1 },
    { label: 'Parcela Brechó', value: fmt(parcelaBrecho), icon: TrendingUp, colorIdx: 2 },
    { label: 'Total Pago', value: fmt(totalPago), icon: CheckCircle, colorIdx: 3 },
    { label: 'Saldo a Pagar', value: fmt(saldoPagar), icon: Wallet, colorIdx: 4 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Drop filter */}
      <div className="filter-bar flex items-center gap-4">
        <label className="label-upper">Drop:</label>
        <Select value={dropFilter} onValueChange={setDropFilter}>
          <SelectTrigger className="w-44 rounded-full bg-muted/50 border-0"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Drops</SelectItem>
            {drops.map(d => <SelectItem key={d} value={String(d)}>Drop {d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Indicator cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 animate-stagger">
        {indicators.map((ind, i) => (
          <Card key={ind.label} className="card-modern border-0 bg-card overflow-hidden">
            <CardContent className="p-6">
              <div className={`icon-circle h-12 w-12 mb-4 ${iconColors[i]}`}>
                <ind.icon className="h-6 w-6" />
              </div>
              <p className="text-3xl font-bold font-heading tracking-tight">{ind.value}</p>
              <p className="label-upper mt-2">{ind.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forecast card */}
      <Card className="card-modern border-2 border-dashed border-accent/30 bg-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading flex items-center gap-3">
            <div className="icon-circle h-10 w-10 bg-accent/15 text-accent">
              <Package className="h-5 w-5" />
            </div>
            Previsão de Faturamento
            <Badge className="ml-2 pill-badge bg-accent/15 text-accent border-0">
              {disponíveis.length} peças disponíveis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <p className="label-upper">Fat. Previsto</p>
              <p className="text-2xl font-bold font-heading mt-1">{fmt(prevFaturamento)}</p>
            </div>
            <div>
              <p className="label-upper">Comissão Prevista</p>
              <p className="text-2xl font-bold font-heading mt-1">{fmt(prevComissao)}</p>
            </div>
            <div>
              <p className="label-upper">Parcela Brechó Prev.</p>
              <p className="text-2xl font-bold font-heading mt-1">{fmt(prevParcelaBrecho)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repasses table */}
      {repasses.length > 0 && (
        <Card className="card-modern overflow-hidden border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-heading">Repasses por Fornecedora</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-premium">
                <thead>
                  <tr>
                    <th className="text-left">Nome</th>
                    <th className="text-left">Comissão Devida</th>
                    <th className="text-left">Parte Brechó</th>
                    <th className="text-left">Total a Receber</th>
                    <th className="text-left">Progresso</th>
                    <th className="text-left">Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {repasses.map(r => {
                    const progress = r.comissaoDevida > 0 ? (r.pago / r.comissaoDevida) * 100 : 100;
                    return (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                              {r.nome.charAt(0).toUpperCase()}
                            </div>
                            <span>{r.nome}</span>
                            {r.ehSocia && <Badge className="pill-badge bg-accent/15 text-accent border-0">⭐ Sócia</Badge>}
                          </div>
                        </td>
                        <td className="font-mono-price">{fmt(r.comissaoDevida)}</td>
                        <td className="font-mono-price">{r.ehSocia ? fmt(r.parteBrechoSocia) : '—'}</td>
                        <td className="font-mono-price font-bold text-primary">{fmt(r.totalReceber)}</td>
                        <td className="min-w-[120px]">
                          <Progress value={progress} className="h-2.5 rounded-full" />
                          <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% pago</p>
                        </td>
                        <td>
                          {r.pendente <= 0 ? (
                            <span className="pill-badge bg-status-available/15 text-status-available">✓ Pago</span>
                          ) : (
                            <span className="pill-badge bg-destructive/10 text-destructive">Pendente ({r.vendasPendentes})</span>
                          )}
                        </td>
                        <td>
                          {r.vendasPendentes > 0 && (
                            <Button size="sm" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm" onClick={() => handlePagarTudo(r.id)}>
                              Pagar Tudo
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previsão por fornecedora */}
      {previsaoForn.length > 0 && (
        <Card className="card-modern overflow-hidden border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-heading">Previsão por Fornecedora</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-premium">
                <thead>
                  <tr>
                    <th className="text-left">Nome</th>
                    <th className="text-left">Qtd Peças</th>
                    <th className="text-left">Prev. Comissão</th>
                    <th className="text-left">Prev. Parcela Brechó</th>
                    <th className="text-left">Total Previsto</th>
                  </tr>
                </thead>
                <tbody>
                  {previsaoForn.map(r => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent">
                            {r.nome.charAt(0).toUpperCase()}
                          </div>
                          {r.nome}
                        </div>
                      </td>
                      <td>
                        <span className="pill-badge bg-muted text-foreground">{r.qtd}</span>
                      </td>
                      <td className="font-mono-price">{fmt(r.prevComissao)}</td>
                      <td className="font-mono-price">{fmt(r.prevBrecho)}</td>
                      <td className="font-mono-price font-bold text-primary">{fmt(r.prevTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
