import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { store } from '@/lib/store';
import { fmt } from '@/lib/fmt';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Users, Package, Wallet, CheckCircle, Filter } from 'lucide-react';
import { toast } from 'sonner';

import logo from '@/assets/logo_peaoge_sem_fundo.png';
import saiaXadrez from '@/assets/photos/saia_xadrez_edit.png';
import flatlay2 from '@/assets/photos/flatlay2_edit.png';
import shortsJeans from '@/assets/photos/shorts_jeans_edit.png';
import looksCabide from '@/assets/photos/looks_cabide_edit.png';
import camisetasRosa from '@/assets/photos/camisetas_rosa_edit.png';
import flatlayPlan from '@/assets/photos/flatlay_edited.jpg';

const photoStrip = [
  { src: saiaXadrez, label: 'DASHBOARD', path: '/' },
  { src: flatlay2, label: 'CATÁLOGO', path: '/catalogo' },
  { src: shortsJeans, label: 'VENDAS', path: '/vendas' },
  { src: looksCabide, label: 'FORNECEDORAS', path: '/fornecedoras' },
  { src: flatlayPlan, label: 'PLANEJAMENTO', path: '/planejamento' },
  { src: camisetasRosa, label: 'CONFIGURAÇÕES', path: '/configuracoes' },
];

const topBarColors = ['#2d4a2e', '#e8527a', '#f0a500', '#3ab5a0', '#9b59b6', '#7b61ff'];
const iconBgs = ['bg-primary/10 text-primary', 'bg-accent/10 text-accent', 'bg-[#f0a500]/10 text-[#f0a500]', 'bg-[#3ab5a0]/10 text-[#3ab5a0]', 'bg-[#7b61ff]/10 text-[#7b61ff]'];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setTick] = useState(0);
  const reload = () => setTick(t => t + 1);

  const [dropFilter, setDropFilter] = useState<string>('all');
  const config = store.getConfig();
  const fornecedoras = store.getFornecedoras();
  const pecas = store.getPecas();
  const vendas = store.getVendas();

  const userName = localStorage.getItem('brecho_user_name') || 'Peaogê';

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
    { label: 'FATURAMENTO BRUTO', value: fmt(faturamento), icon: DollarSign, colorIdx: 0 },
    { label: 'COMISSÃO FORNECEDORAS', value: fmt(comissaoTotal), icon: Users, colorIdx: 1 },
    { label: 'PARCELA BRECHÓ', value: fmt(parcelaBrecho), icon: TrendingUp, colorIdx: 2 },
    { label: 'TOTAL PAGO', value: fmt(totalPago), icon: CheckCircle, colorIdx: 3 },
    { label: 'SALDO A PAGAR', value: fmt(saldoPagar), icon: Wallet, colorIdx: 4 },
  ];

  return (
    <div className="space-y-8 animate-fade-up">

      {/* PHOTO STRIP */}
      <section className="flex md:grid md:grid-cols-6 gap-1 h-[120px] md:h-[160px] rounded-2xl overflow-x-auto md:overflow-hidden scrollbar-hide">
        {photoStrip.map((photo, i) => {
          const isActive = location.pathname === photo.path;
          return (
            <div
              key={photo.label}
              className="relative overflow-hidden group cursor-pointer min-w-[120px] md:min-w-0 flex-shrink-0"
              onClick={() => navigate(photo.path)}
              role="link"
            >
              <img
                src={photo.src}
                alt={photo.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className={`absolute inset-0 transition-colors duration-300 ${isActive ? 'bg-gradient-to-t from-black/30 to-transparent' : 'bg-gradient-to-t from-black/60 to-black/10'}`} />
              <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: topBarColors[i] }} />
              <span
                className={`absolute bottom-3 left-2 md:bottom-4 md:left-3 font-display text-[10px] md:text-sm tracking-[0.1em] transition-colors duration-300 text-secondary-foreground ${isActive ? 'brightness-125' : ''}`}
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
              >
                {photo.label}
              </span>
            </div>
          );
        })}
      </section>

      {/* GREETING */}
      <p className="text-sm text-muted-foreground tracking-wide">
        Olá, {userName} 👋 — seu painel de controle
      </p>

      {/* DROP FILTER BAR */}
      <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="label-upper">Filtrar por Drop:</span>
        <Select value={dropFilter} onValueChange={setDropFilter}>
          <SelectTrigger className="w-44 rounded-full bg-background border border-border text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Drops</SelectItem>
            {drops.map(d => <SelectItem key={d} value={String(d)}>Drop {d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-stagger">
        {indicators.map((ind, i) => (
          <div
            key={ind.label}
            className="bg-card border border-border overflow-hidden transition-transform duration-300 hover:translate-y-[-2px]"
            style={{ borderRadius: '0 0 16px 16px' }}
          >
            <div className="h-[3px]" style={{ backgroundColor: topBarColors[i] }} />
            <div className="p-5">
              <div className={`icon-circle h-10 w-10 mb-3 rounded-full ${iconBgs[i]}`}>
                <ind.icon className="h-5 w-5" />
              </div>
              <p className="font-display text-[40px] leading-none text-foreground">{ind.value}</p>
              <p className="label-upper mt-2">{ind.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FORECAST CARD */}
      <div className="bg-primary rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="font-display text-2xl tracking-wide flex items-center gap-3 text-white">
            <Package className="h-6 w-6" />
            PREVISÃO DE FATURAMENTO
          </h2>
          <span className="pill-badge bg-accent text-accent-foreground">
            {disponíveis.length} peças disponíveis
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <p className="label-upper text-white/50">Fat. Previsto</p>
            <p className="font-display text-2xl sm:text-3xl mt-1 text-white">{fmt(prevFaturamento)}</p>
          </div>
          <div>
            <p className="label-upper text-white/50">Comissão Prev.</p>
            <p className="font-display text-2xl sm:text-3xl mt-1 text-white">{fmt(prevComissao)}</p>
          </div>
          <div>
            <p className="label-upper text-white/50">Parcela Brechó</p>
            <p className="font-display text-2xl sm:text-3xl mt-1 text-white">{fmt(prevParcelaBrecho)}</p>
          </div>
        </div>
      </div>

      {/* TABLES — full width with tabs */}
      {(repasses.length > 0 || previsaoForn.length > 0) && (
        <div className="card-editorial overflow-hidden">
          <Tabs defaultValue="repasses">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <TabsList className="bg-muted rounded-full">
                <TabsTrigger value="repasses" className="rounded-full font-display text-sm tracking-wide px-5">
                  REPASSES
                </TabsTrigger>
                <TabsTrigger value="previsao" className="rounded-full font-display text-sm tracking-wide px-5">
                  PREVISÃO
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="repasses" className="mt-0">
              {repasses.length > 0 ? (
                <>
                  {/* Desktop table */}
                  <table className="hidden md:table w-full text-sm table-editorial">
                    <thead>
                      <tr>
                        <th className="text-left">NOME</th>
                        <th className="text-left">COMISSÃO</th>
                        <th className="text-left">P. BRECHÓ</th>
                        <th className="text-left">TOTAL</th>
                        <th className="text-left">PROGRESSO</th>
                        <th className="text-left">STATUS</th>
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
                                <div
                                  className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                  style={{ backgroundColor: `hsl(${r.nome.charCodeAt(0) * 7 % 360}, 45%, 45%)` }}
                                >
                                  {r.nome.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm">{r.nome}</span>
                                {r.ehSocia && <span className="pill-badge bg-accent/15 text-accent text-[10px]">⭐ Sócia</span>}
                              </div>
                            </td>
                            <td className="font-mono-price text-xs">{fmt(r.comissaoDevida)}</td>
                            <td className="font-mono-price text-xs">{r.ehSocia ? fmt(r.parteBrechoSocia) : '—'}</td>
                            <td className="font-mono-price text-xs font-bold text-primary">{fmt(r.totalReceber)}</td>
                            <td className="min-w-[100px]">
                              <Progress value={progress} className="h-1.5 rounded-full" />
                              <p className="text-[10px] text-muted-foreground mt-1">{Math.round(progress)}%</p>
                            </td>
                            <td>
                              {r.pendente <= 0 ? (
                                <span className="pill-badge bg-status-available/15 text-status-available text-[10px]">✓ Pago</span>
                              ) : (
                                <span className="pill-badge bg-status-reserved/15 text-status-reserved text-[10px]">Pendente ({r.vendasPendentes})</span>
                              )}
                            </td>
                            <td>
                              {r.vendasPendentes > 0 && (
                                <Button size="sm" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-8 px-4" onClick={() => handlePagarTudo(r.id)}>
                                  Pagar
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-border">
                    {repasses.map(r => {
                      const progress = r.comissaoDevida > 0 ? (r.pago / r.comissaoDevida) * 100 : 100;
                      return (
                        <div key={r.id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{ backgroundColor: `hsl(${r.nome.charCodeAt(0) * 7 % 360}, 45%, 45%)` }}
                              >
                                {r.nome.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium">{r.nome}</span>
                              {r.ehSocia && <span className="pill-badge bg-accent/15 text-accent text-[10px]">⭐</span>}
                            </div>
                            {r.pendente <= 0 ? (
                              <span className="pill-badge bg-status-available/15 text-status-available text-[10px]">✓ Pago</span>
                            ) : (
                              <span className="pill-badge bg-status-reserved/15 text-status-reserved text-[10px]">Pendente</span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div><p className="text-[9px] text-muted-foreground uppercase">Comissão</p><p className="font-mono-price text-xs">{fmt(r.comissaoDevida)}</p></div>
                            <div><p className="text-[9px] text-muted-foreground uppercase">Brechó</p><p className="font-mono-price text-xs">{r.ehSocia ? fmt(r.parteBrechoSocia) : '—'}</p></div>
                            <div><p className="text-[9px] text-muted-foreground uppercase">Total</p><p className="font-mono-price text-xs font-bold text-primary">{fmt(r.totalReceber)}</p></div>
                          </div>
                          <div>
                            <Progress value={progress} className="h-1.5 rounded-full" />
                            <p className="text-[10px] text-muted-foreground mt-1">{Math.round(progress)}%</p>
                          </div>
                          {r.vendasPendentes > 0 && (
                            <Button size="sm" className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-8" onClick={() => handlePagarTudo(r.id)}>
                              Pagar Tudo ({r.vendasPendentes})
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="empty-state py-12">
                  <p className="text-sm">Nenhum repasse registrado</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="previsao" className="mt-0">
              {previsaoForn.length > 0 ? (
                <>
                  {/* Desktop table */}
                  <table className="hidden md:table w-full text-sm table-editorial">
                    <thead>
                      <tr>
                        <th className="text-left">NOME</th>
                        <th className="text-left">QTD</th>
                        <th className="text-left">PREV. COMISSÃO</th>
                        <th className="text-left">PREV. BRECHÓ</th>
                        <th className="text-left">TOTAL PREV.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previsaoForn.map(r => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="font-medium">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{ backgroundColor: `hsl(${r.nome.charCodeAt(0) * 7 % 360}, 45%, 45%)` }}
                              >
                                {r.nome.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm">{r.nome}</span>
                            </div>
                          </td>
                          <td><span className="pill-badge bg-muted text-foreground text-[10px]">{r.qtd}</span></td>
                          <td className="font-mono-price text-xs">{fmt(r.prevComissao)}</td>
                          <td className="font-mono-price text-xs">{fmt(r.prevBrecho)}</td>
                          <td className="font-mono-price text-xs font-bold text-primary">{fmt(r.prevTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-border">
                    {previsaoForn.map(r => (
                      <div key={r.id} className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: `hsl(${r.nome.charCodeAt(0) * 7 % 360}, 45%, 45%)` }}
                          >
                            {r.nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">{r.nome}</span>
                          <span className="pill-badge bg-muted text-foreground text-[10px] ml-auto">{r.qtd} peças</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div><p className="text-[9px] text-muted-foreground uppercase">Comissão</p><p className="font-mono-price text-xs">{fmt(r.prevComissao)}</p></div>
                          <div><p className="text-[9px] text-muted-foreground uppercase">Brechó</p><p className="font-mono-price text-xs">{fmt(r.prevBrecho)}</p></div>
                          <div><p className="text-[9px] text-muted-foreground uppercase">Total</p><p className="font-mono-price text-xs font-bold text-primary">{fmt(r.prevTotal)}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state py-12">
                  <p className="text-sm">Nenhuma peça disponível para previsão</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Logo watermark */}
      <div className="fixed bottom-4 right-4 pointer-events-none z-30">
        <img
          src={logo}
          alt=""
          className="w-[80px] h-auto"
          style={{ transform: 'rotate(8deg)', opacity: 0.15 }}
        />
      </div>
    </div>
  );
}
