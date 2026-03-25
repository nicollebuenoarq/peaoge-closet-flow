import { useMemo, useState } from 'react';
import { store } from '@/lib/store';
import { Fornecedora, Peca, Venda } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, Package, Wallet, CheckCircle } from 'lucide-react';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Dashboard() {
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

  // Previsão
  const prevFaturamento = disponíveis.reduce((s, p) => s + p.preco, 0);
  const prevComissao = prevFaturamento * config.percentualFornecedora;
  const prevParcelaBrecho = prevFaturamento * config.percentualBrecho;

  // Repasses por fornecedora
  const socias = fornecedoras.filter(f => f.ehSocia);
  const parcelaSocia = parcelaBrecho / (socias.length || 1);

  const repasses = fornecedoras.map(f => {
    const vendasF = filteredVendas.filter(v => v.fornecedoraId === f.id);
    const comissaoDevida = vendasF.reduce((s, v) => s + v.comissaoFornecedora, 0);
    const pago = vendasF.filter(v => v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);
    const parteBrechoSocia = f.ehSocia ? parcelaSocia : 0;
    const totalReceber = comissaoDevida + parteBrechoSocia;
    const pendente = comissaoDevida - pago;
    return { ...f, comissaoDevida, parteBrechoSocia, totalReceber, pago, pendente, vendasCount: vendasF.length };
  }).filter(r => r.vendasCount > 0 || r.parteBrechoSocia > 0);

  // Previsão por fornecedora
  const previsaoForn = fornecedoras.map(f => {
    const pecasF = disponíveis.filter(p => p.fornecedoraId === f.id);
    const prevComF = pecasF.reduce((s, p) => s + p.preco, 0) * config.percentualFornecedora;
    const prevBrechoF = pecasF.reduce((s, p) => s + p.preco, 0) * config.percentualBrecho;
    return { ...f, qtd: pecasF.length, prevComissao: prevComF, prevBrecho: prevBrechoF, prevTotal: prevComF + (f.ehSocia ? prevBrechoF / (socias.length || 1) : 0) };
  }).filter(r => r.qtd > 0);

  const indicators = [
    { label: 'Faturamento Bruto', value: fmt(faturamento), icon: DollarSign, color: 'text-primary' },
    { label: 'Comissão Fornecedoras', value: fmt(comissaoTotal), icon: Users, color: 'text-secondary' },
    { label: 'Parcela Brechó', value: fmt(parcelaBrecho), icon: TrendingUp, color: 'text-accent-foreground' },
    { label: 'Total Pago', value: fmt(totalPago), icon: CheckCircle, color: 'text-secondary' },
    { label: 'Saldo a Pagar', value: fmt(saldoPagar), icon: Wallet, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      {/* Drop selector */}
      <div className="flex items-center gap-3">
        <label className="font-heading font-semibold text-sm">DROP:</label>
        <Select value={dropFilter} onValueChange={setDropFilter}>
          <SelectTrigger className="w-40 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {drops.map(d => (
              <SelectItem key={d} value={String(d)}>Drop {d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {indicators.map(ind => (
          <Card key={ind.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ind.icon className={`h-4 w-4 ${ind.color}`} />
                <span className="text-xs text-muted-foreground">{ind.label}</span>
              </div>
              <p className="text-lg font-bold font-heading">{ind.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Previsão */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Package className="h-4 w-4" /> Previsão de Faturamento ({disponíveis.length} peças disponíveis)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Fat. Previsto</p>
              <p className="font-bold">{fmt(prevFaturamento)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Comissão Prevista</p>
              <p className="font-bold">{fmt(prevComissao)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Parcela Brechó Prev.</p>
              <p className="font-bold">{fmt(prevParcelaBrecho)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repasses */}
      {repasses.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Repasses por Fornecedora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2">Nome</th>
                    <th className="pb-2">Comissão Devida</th>
                    <th className="pb-2">Parte Brechó</th>
                    <th className="pb-2">Total a Receber</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {repasses.map(r => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">
                        {r.nome} {r.ehSocia && <Badge variant="outline" className="ml-1 text-xs border-accent text-accent-foreground">⭐ Sócia</Badge>}
                      </td>
                      <td className="py-2">{fmt(r.comissaoDevida)}</td>
                      <td className="py-2">{r.ehSocia ? fmt(r.parteBrechoSocia) : '—'}</td>
                      <td className="py-2 font-semibold">{fmt(r.totalReceber)}</td>
                      <td className="py-2">
                        {r.pendente <= 0 ? (
                          <Badge className="bg-secondary/20 text-secondary border-0">Pago</Badge>
                        ) : (
                          <Badge variant="outline" className="border-destructive/30 text-destructive">Pendente</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previsão por fornecedora */}
      {previsaoForn.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Previsão por Fornecedora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2">Nome</th>
                    <th className="pb-2">Qtd Peças</th>
                    <th className="pb-2">Prev. Comissão</th>
                    <th className="pb-2">Prev. Parcela Brechó</th>
                    <th className="pb-2">Total Previsto</th>
                  </tr>
                </thead>
                <tbody>
                  {previsaoForn.map(r => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{r.nome}</td>
                      <td className="py-2">{r.qtd}</td>
                      <td className="py-2">{fmt(r.prevComissao)}</td>
                      <td className="py-2">{fmt(r.prevBrecho)}</td>
                      <td className="py-2 font-semibold">{fmt(r.prevTotal)}</td>
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
