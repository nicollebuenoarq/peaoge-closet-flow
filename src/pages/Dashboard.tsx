import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { store } from '@/lib/store';
import { fmt } from '@/lib/fmt';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, Users, Package, Wallet, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import logo from '@/assets/logo_peaoge_sem_fundo.png';
import saiaXadrez from '@/assets/photos/saia_xadrez_edit.png';
import flatlay2 from '@/assets/photos/flatlay2_edit.png';
import shortsJeans from '@/assets/photos/shorts_jeans_edit.png';
import looksCabide from '@/assets/photos/looks_cabide_edit.png';
import camisetasRosa from '@/assets/photos/camisetas_rosa_edit.png';
import flatlayEdit from '@/assets/photos/flatlay_edit.png';

const photoStrip = [
  { src: saiaXadrez, label: 'SAIA' },
  { src: flatlay2, label: 'CASUAL' },
  { src: shortsJeans, label: 'JEANS' },
  { src: looksCabide, label: 'LOOKS' },
  { src: camisetasRosa, label: 'CAMISETAS' },
];

const topBarColors = ['#2d4a2e', '#e8527a', '#f0a500', '#3ab5a0', '#7b61ff'];
const iconBgs = ['bg-primary/10 text-primary', 'bg-accent/10 text-accent', 'bg-[#f0a500]/10 text-[#f0a500]', 'bg-[#3ab5a0]/10 text-[#3ab5a0]', 'bg-[#7b61ff]/10 text-[#7b61ff]'];

export default function Dashboard() {
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
    <div className="space-y-10 animate-fade-up">
      {/* HERO BANNER — oversized */}
      <section className="relative overflow-hidden py-14 md:py-20">
        {/* Ghost text — pinned right, bleeding off-screen */}
        <span
          className="absolute top-1/2 -translate-y-1/2 right-[-20px] pointer-events-none select-none font-display text-[140px] md:text-[200px] lg:text-[260px] text-primary/[0.06] leading-none tracking-[0.08em] whitespace-nowrap z-0"
          aria-hidden="true"
        >
          PEAOGÊ
        </span>

        <div className="relative z-[1] flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-primary leading-[0.85] tracking-[0.04em]">
              GESTÃO DE<br />
              <span className="font-serif-italic text-accent">Estilo</span>
            </h1>
            <p className="font-mono text-xs text-muted-foreground mt-3 tracking-wide">
              Olá, {userName} 👋 — seu painel de controle
            </p>
          </div>

          {/* Drop filter */}
          <div className="flex items-center gap-3">
            <span className="label-upper">Drop:</span>
            <Select value={dropFilter} onValueChange={setDropFilter}>
              <SelectTrigger className="w-40 rounded-full bg-card border border-border font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Drops</SelectItem>
                {drops.map(d => <SelectItem key={d} value={String(d)}>Drop {d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* PHOTO STRIP — extra spacing below */}
      <section className="grid grid-cols-5 gap-1 h-[160px] rounded-2xl overflow-hidden">
        {photoStrip.map((photo) => (
          <div key={photo.label} className="relative overflow-hidden group cursor-pointer">
            <img
              src={photo.src}
              alt={photo.label}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 left-3 font-display text-white text-sm tracking-[0.1em]" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {photo.label}
            </span>
          </div>
        ))}
      </section>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-stagger mt-10">
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

      {/* FORECAST CARD — dark green */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="font-display text-2xl tracking-wide flex items-center gap-3">
            <Package className="h-6 w-6" />
            PREVISÃO DE FATURAMENTO
          </h2>
          <span className="pill-badge bg-accent text-accent-foreground">
            {disponíveis.length} peças disponíveis
          </span>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="label-upper text-primary-foreground/60">Fat. Previsto</p>
            <p className="font-display text-3xl mt-1">{fmt(prevFaturamento)}</p>
          </div>
          <div>
            <p className="label-upper text-primary-foreground/60">Comissão Prev.</p>
            <p className="font-display text-3xl mt-1">{fmt(prevComissao)}</p>
          </div>
          <div>
            <p className="label-upper text-primary-foreground/60">Parcela Brechó</p>
            <p className="font-display text-3xl mt-1">{fmt(prevParcelaBrecho)}</p>
          </div>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT: Tables + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main column */}
        <div className="space-y-6">
          {/* Repasses table */}
          {repasses.length > 0 && (
            <div className="card-editorial overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-display text-xl text-primary tracking-wide">REPASSES POR FORNECEDORA</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-editorial">
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
                                className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ backgroundColor: `hsl(${r.nome.charCodeAt(0) * 7 % 360}, 45%, 45%)` }}
                              >
                                {r.nome.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-mono text-xs">{r.nome}</span>
                              {r.ehSocia && <span className="pill-badge bg-accent/15 text-accent text-[10px]">⭐ Sócia</span>}
                            </div>
                          </td>
                          <td className="font-mono-price text-xs">{fmt(r.comissaoDevida)}</td>
                          <td className="font-mono-price text-xs">{r.ehSocia ? fmt(r.parteBrechoSocia) : '—'}</td>
                          <td className="font-mono-price text-xs font-bold text-primary">{fmt(r.totalReceber)}</td>
                          <td className="min-w-[100px]">
                            <Progress value={progress} className="h-1.5 rounded-full" />
                            <p className="text-[10px] text-muted-foreground mt-1 font-mono">{Math.round(progress)}%</p>
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
                              <Button size="sm" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-[10px] h-7 px-3" onClick={() => handlePagarTudo(r.id)}>
                                Pagar
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Previsão por fornecedora */}
          {previsaoForn.length > 0 && (
            <div className="card-editorial overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-display text-xl text-primary tracking-wide">PREVISÃO POR FORNECEDORA</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-editorial">
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
                              className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                              style={{ backgroundColor: `hsl(${r.nome.charCodeAt(0) * 7 % 360}, 45%, 45%)` }}
                            >
                              {r.nome.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-mono text-xs">{r.nome}</span>
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
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pink CTA card */}
          <div className="bg-accent rounded-2xl p-6 text-white">
            <h3 className="font-display text-3xl leading-none tracking-wide">
              MODA<br />
              <span className="font-serif-italic text-accent-light">Circular</span>
            </h3>
            <p className="font-mono text-[10px] mt-3 opacity-80 leading-relaxed">
              Cada peça conta uma história. Dê uma nova vida ao seu guarda-roupa com estilo.
            </p>
            <Button
              variant="outline"
              className="mt-4 rounded-full bg-white text-accent hover:bg-white/90 border-0 font-mono text-xs font-bold"
            >
              VER CATÁLOGO
            </Button>
          </div>

          {/* Lookbook photo card */}
          <div className="relative h-[280px] rounded-2xl overflow-hidden group cursor-pointer">
            <img
              src={flatlayEdit}
              alt="Flat Lay"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <p className="font-display text-3xl text-white leading-none tracking-wide">FLAT LAY</p>
              <p className="font-mono text-[10px] text-white/70 mt-1 tracking-widest uppercase">Novidades do Drop</p>
            </div>
          </div>
        </div>
      </div>

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
