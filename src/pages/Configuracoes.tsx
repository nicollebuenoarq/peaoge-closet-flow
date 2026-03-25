import { useState } from 'react';
import { store } from '@/lib/store';
import { resetAndReimport } from '@/lib/initialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, RotateCcw, Settings2, CreditCard, Tags, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function Configuracoes() {
  const [, setTick] = useState(0);
  const reload = () => setTick(t => t + 1);

  const config = store.getConfig();

  const [percForn, setPercForn] = useState(String(config.percentualFornecedora * 100));
  const [percBrecho, setPercBrecho] = useState(String(config.percentualBrecho * 100));
  const [taxaCartao, setTaxaCartao] = useState(String(config.taxaCartao * 100));
  const [dropAtual, setDropAtual] = useState(String(config.dropAtual));

  const [novoStatus, setNovoStatus] = useState('');
  const [novoPgto, setNovoPgto] = useState('');

  const savePercentuais = () => {
    const c = store.getConfig();
    c.percentualFornecedora = parseFloat(percForn) / 100;
    c.percentualBrecho = parseFloat(percBrecho) / 100;
    c.taxaCartao = parseFloat(taxaCartao) / 100;
    c.dropAtual = parseInt(dropAtual) || c.dropAtual;
    store.setConfig(c);
    toast.success('Configurações salvas');
    reload();
  };

  const addStatus = () => {
    if (!novoStatus) return;
    const c = store.getConfig();
    if (!c.statusValidos.includes(novoStatus)) {
      c.statusValidos.push(novoStatus);
      store.setConfig(c);
      toast.success(`Status "${novoStatus}" adicionado`);
    }
    setNovoStatus('');
    reload();
  };

  const removeStatus = (s: string) => {
    const c = store.getConfig();
    c.statusValidos = c.statusValidos.filter(x => x !== s);
    store.setConfig(c);
    toast.success(`Status "${s}" removido`);
    reload();
  };

  const addPgto = () => {
    if (!novoPgto) return;
    const c = store.getConfig();
    if (!c.meiosPagamento.includes(novoPgto)) {
      c.meiosPagamento.push(novoPgto);
      store.setConfig(c);
      toast.success(`Meio de pagamento "${novoPgto}" adicionado`);
    }
    setNovoPgto('');
    reload();
  };

  const removePgto = (s: string) => {
    const c = store.getConfig();
    c.meiosPagamento = c.meiosPagamento.filter(x => x !== s);
    store.setConfig(c);
    toast.success(`Meio "${s}" removido`);
    reload();
  };

  return (
    <div className="space-y-8 max-w-2xl animate-fade-in">
      <Card className="card-modern overflow-hidden border-0">
        <CardHeader className="bg-primary -mx-px -mt-px px-6 pt-6 pb-4">
          <CardTitle className="font-heading text-base flex items-center gap-3 text-primary-foreground">
            <div className="icon-circle h-10 w-10 bg-primary-foreground/15">
              <Settings2 className="h-5 w-5" />
            </div>
            Percentuais e Taxas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="label-upper">% Fornecedora</Label><Input type="number" step="1" value={percForn} onChange={e => setPercForn(e.target.value)} className="mt-1.5 rounded-xl" /></div>
            <div><Label className="label-upper">% Brechó</Label><Input type="number" step="1" value={percBrecho} onChange={e => setPercBrecho(e.target.value)} className="mt-1.5 rounded-xl" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="label-upper">Taxa Cartão Crédito (%)</Label><Input type="number" step="0.1" value={taxaCartao} onChange={e => setTaxaCartao(e.target.value)} className="mt-1.5 rounded-xl" /></div>
            <div><Label className="label-upper">Drop Atual</Label><Input type="number" value={dropAtual} onChange={e => setDropAtual(e.target.value)} className="mt-1.5 rounded-xl" /></div>
          </div>
          <Button onClick={savePercentuais} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"><Save className="h-4 w-4 mr-1" /> Salvar</Button>
        </CardContent>
      </Card>

      <Card className="card-modern overflow-hidden border-0">
        <CardHeader className="bg-accent/10 pb-4">
          <CardTitle className="font-heading text-base flex items-center gap-3">
            <div className="icon-circle h-10 w-10 bg-accent/15 text-accent">
              <Tags className="h-5 w-5" />
            </div>
            Status Válidos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {config.statusValidos.map(s => (
              <Badge key={s} variant="outline" className="gap-1.5 rounded-full px-4 py-1.5 text-sm">
                {s}
                <button onClick={() => removeStatus(s)} className="hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={novoStatus} onChange={e => setNovoStatus(e.target.value)} placeholder="Novo status..." className="flex-1 rounded-xl" />
            <Button size="sm" onClick={addStatus} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-modern overflow-hidden border-0">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="font-heading text-base flex items-center gap-3">
            <div className="icon-circle h-10 w-10 bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            Meios de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {config.meiosPagamento.map(s => (
              <Badge key={s} variant="outline" className="gap-1.5 rounded-full px-4 py-1.5 text-sm">
                {s}
                <button onClick={() => removePgto(s)} className="hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={novoPgto} onChange={e => setNovoPgto(e.target.value)} placeholder="Novo meio..." className="flex-1 rounded-xl" />
            <Button size="sm" onClick={addPgto} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-modern overflow-hidden border-destructive/30 border-2">
        <CardHeader className="bg-destructive/5 pb-4">
          <CardTitle className="font-heading text-base flex items-center gap-3">
            <div className="icon-circle h-10 w-10 bg-destructive/10 text-destructive">
              <Database className="h-5 w-5" />
            </div>
            Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground mb-4">Limpa todos os dados e reimporta os dados iniciais da planilha original.</p>
          <Button variant="destructive" className="rounded-full shadow-md" onClick={() => {
            if (confirm('Tem certeza? Todos os dados atuais serão perdidos!')) {
              resetAndReimport();
              window.location.reload();
            }
          }}>
            <RotateCcw className="h-4 w-4 mr-1" /> Resetar e Reimportar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
