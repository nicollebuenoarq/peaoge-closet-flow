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
    { label: 'Faturamento Bruto', value: fmt(faturamento), icon: DollarSign, gradient: 'indicator-gradient-green' },
    { label: 'Comissão Fornecedoras', value: fmt(comissaoTotal), icon: Users, gradient: 'indicator-gradient-gold' },
    { label: 'Parcela Brechó', value: fmt(parcelaBrecho), icon: TrendingUp, gradient: 'indicator-gradient-green' },
    { label: 'Total Pago', value: fmt(totalPago), icon: CheckCircle, gradient: 'indicator-gradient-teal' },
    { label: 'Saldo a Pagar', value: fmt(saldoPagar), icon: Wallet, gradient: 'indicator-gradient-red' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Drop filter */}
      <div className="glass rounded-xl p-4 flex items-center gap-3">
        <label className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">Drop:</label>
        <Select value={dropFilter} onValueChange={setDropFilter}>
          <SelectTrigger className="w-40 bg-card border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Drops</SelectItem>
            {drops.map(d => <SelectItem key={d} value={String(d)}>Drop {d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Indicator cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-stagger">
        {indicators.map(ind => (
          <Card key={ind.label} className={`card-elevated ${ind.gradient} border-0 overflow-hidden`}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-card/80 flex items-center justify-center shadow-sm">
                  <ind.icon className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <p className="text-2xl font-bold font-heading tracking-tight">{ind.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{ind.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forecast card */}
      <Card className="card-elevated border-dashed border-2 border-accent/30 bg-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Package className="h-4 w-4 text-accent-foreground" />
            </div>
            Previsão de Faturamento
            <Badge variant="outline" className="ml-2 text-xs border-accent/30 text-accent-foreground font-normal">
              {disponíveis.length} peças disponíveis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Fat. Previsto</p>
              <p className="text-xl font-bold font-heading mt-1">{fmt(prevFaturamento)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Comissão Prevista</p>
              <p className="text-xl font-bold font-heading mt-1">{fmt(prevComissao)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Parcela Brechó Prev.</p>
              <p className="text-xl font-bold font-heading mt-1">{fmt(prevParcelaBrecho)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repasses table */}
      {repasses.length > 0 && (
        <Card className="card-elevated overflow-hidden">
          <CardHeader className="pb-3 bg-muted/20">
            <CardTitle className="text-base font-heading">Repasses por Fornecedora</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-modern table-zebra">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Nome</th>
                    <th className="p-3 text-left">Comissão Devida</th>
                    <th className="p-3 text-left">Parte Brechó</th>
                    <th className="p-3 text-left">Total a Receber</th>
                    <th className="p-3 text-left">Progresso</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {repasses.map(r => {
                    const progress = r.comissaoDevida > 0 ? (r.pago / r.comissaoDevida) * 100 : 100;
                    return (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {r.nome.charAt(0).toUpperCase()}
                            </div>
                            <span>{r.nome}</span>
                            {r.ehSocia && <Badge variant="outline" className="text-xs border-accent text-accent-foreground">⭐ Sócia</Badge>}
                          </div>
                        </td>
                        <td className="p-3 font-mono-price">{fmt(r.comissaoDevida)}</td>
                        <td className="p-3 font-mono-price">{r.ehSocia ? fmt(r.parteBrechoSocia) : '—'}</td>
                        <td className="p-3 font-mono-price font-bold">{fmt(r.totalReceber)}</td>
                        <td className="p-3 min-w-[120px]">
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% pago</p>
                        </td>
                        <td className="p-3">
                          {r.pendente <= 0 ? (
                            <Badge className="bg-status-available/15 text-status-available border-status-available/30 border">✓ Pago</Badge>
                          ) : (
                            <Badge variant="outline" className="border-destructive/30 text-destructive">Pendente ({r.vendasPendentes})</Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {r.vendasPendentes > 0 && (
                            <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors" onClick={() => handlePagarTudo(r.id)}>
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
        <Card className="card-elevated overflow-hidden">
          <CardHeader className="pb-3 bg-muted/20">
            <CardTitle className="text-base font-heading">Previsão por Fornecedora</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-modern table-zebra">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Nome</th>
                    <th className="p-3 text-left">Qtd Peças</th>
                    <th className="p-3 text-left">Prev. Comissão</th>
                    <th className="p-3 text-left">Prev. Parcela Brechó</th>
                    <th className="p-3 text-left">Total Previsto</th>
                  </tr>
                </thead>
                <tbody>
                  {previsaoForn.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent-foreground">
                            {r.nome.charAt(0).toUpperCase()}
                          </div>
                          {r.nome}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="font-mono">{r.qtd}</Badge>
                      </td>
                      <td className="p-3 font-mono-price">{fmt(r.prevComissao)}</td>
                      <td className="p-3 font-mono-price">{fmt(r.prevBrecho)}</td>
                      <td className="p-3 font-mono-price font-bold">{fmt(r.prevTotal)}</td>
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
