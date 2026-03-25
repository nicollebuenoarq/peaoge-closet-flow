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
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <Card className="card-elevated overflow-hidden border-0">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings2 className="h-4 w-4 text-primary" />
            </div>
            Percentuais e Taxas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs uppercase tracking-wider text-muted-foreground">% Fornecedora</Label><Input type="number" step="1" value={percForn} onChange={e => setPercForn(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs uppercase tracking-wider text-muted-foreground">% Brechó</Label><Input type="number" step="1" value={percBrecho} onChange={e => setPercBrecho(e.target.value)} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs uppercase tracking-wider text-muted-foreground">Taxa Cartão Crédito (%)</Label><Input type="number" step="0.1" value={taxaCartao} onChange={e => setTaxaCartao(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs uppercase tracking-wider text-muted-foreground">Drop Atual</Label><Input type="number" value={dropAtual} onChange={e => setDropAtual(e.target.value)} className="mt-1" /></div>
          </div>
          <Button onClick={savePercentuais} className="shadow-md"><Save className="h-4 w-4 mr-1" /> Salvar</Button>
        </CardContent>
      </Card>

      <Card className="card-elevated overflow-hidden border-0">
        <CardHeader className="bg-accent/5 pb-4">
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center">
              <Tags className="h-4 w-4 text-accent-foreground" />
            </div>
            Status Válidos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {config.statusValidos.map(s => (
              <Badge key={s} variant="outline" className="gap-1 rounded-full px-3 py-1">
                {s}
                <button onClick={() => removeStatus(s)} className="hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={novoStatus} onChange={e => setNovoStatus(e.target.value)} placeholder="Novo status..." className="flex-1" />
            <Button size="sm" onClick={addStatus} className="shadow-sm"><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated overflow-hidden border-0">
        <CardHeader className="bg-secondary/5 pb-4">
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-secondary" />
            </div>
            Meios de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {config.meiosPagamento.map(s => (
              <Badge key={s} variant="outline" className="gap-1 rounded-full px-3 py-1">
                {s}
                <button onClick={() => removePgto(s)} className="hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={novoPgto} onChange={e => setNovoPgto(e.target.value)} placeholder="Novo meio..." className="flex-1" />
            <Button size="sm" onClick={addPgto} className="shadow-sm"><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated overflow-hidden border-destructive/20 border">
        <CardHeader className="bg-destructive/5 pb-4">
          <CardTitle className="font-heading text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Database className="h-4 w-4 text-destructive" />
            </div>
            Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground mb-3">Limpa todos os dados e reimporta os dados iniciais da planilha original.</p>
          <Button variant="destructive" className="shadow-md" onClick={() => {
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
