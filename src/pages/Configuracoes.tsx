import { useState } from 'react';
import { store } from '@/lib/store';
import { resetAndReimport } from '@/lib/initialData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, RotateCcw, Settings2, CreditCard, Tags, Database, Lock } from 'lucide-react';
import { toast } from 'sonner';

const sociasList = ['Nicolle', 'Larissa', 'Joice'] as const;

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
    <div className="space-y-8 max-w-2xl animate-fade-up">
      <div className="flex items-center gap-4">
        <div className="icon-circle h-12 w-12 bg-primary/10 text-primary rounded-full">
          <Settings2 className="h-6 w-6" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-primary tracking-wide">CONFIGURAÇÕES</h1>
      </div>

      <div className="card-editorial overflow-hidden">
        <div className="bg-primary px-6 py-4">
          <h3 className="font-display text-lg text-white tracking-wide flex items-center gap-3">
            <div className="icon-circle h-10 w-10 bg-white/15 rounded-full">
              <Settings2 className="h-5 w-5 text-white" />
            </div>
            PERCENTUAIS E TAXAS
          </h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="label-upper">% Fornecedora</Label><Input type="number" step="1" value={percForn} onChange={e => setPercForn(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
            <div><Label className="label-upper">% Brechó</Label><Input type="number" step="1" value={percBrecho} onChange={e => setPercBrecho(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="label-upper">Taxa Cartão Crédito (%)</Label><Input type="number" step="0.1" value={taxaCartao} onChange={e => setTaxaCartao(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
            <div><Label className="label-upper">Drop Atual</Label><Input type="number" value={dropAtual} onChange={e => setDropAtual(e.target.value)} className="mt-1.5 rounded-xl text-sm" /></div>
          </div>
          <Button onClick={savePercentuais} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs">
            <Save className="h-4 w-4 mr-1" /> SALVAR
          </Button>
        </div>
      </div>

      <div className="card-editorial overflow-hidden">
        <div className="bg-accent/10 px-6 py-4 border-b border-border">
          <h3 className="font-display text-lg tracking-wide flex items-center gap-3">
            <div className="icon-circle h-10 w-10 bg-accent/15 text-accent rounded-full">
              <Tags className="h-5 w-5" />
            </div>
            STATUS VÁLIDOS
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {config.statusValidos.map(s => (
              <Badge key={s} variant="outline" className="gap-1.5 rounded-full px-4 py-1.5 text-xs">
                {s}
                <button onClick={() => removeStatus(s)} className="hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={novoStatus} onChange={e => setNovoStatus(e.target.value)} placeholder="Novo status..." className="flex-1 rounded-xl text-sm" />
            <Button size="sm" onClick={addStatus} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="card-editorial overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h3 className="font-display text-lg tracking-wide flex items-center gap-3">
            <div className="icon-circle h-10 w-10 bg-primary/10 text-primary rounded-full">
              <CreditCard className="h-5 w-5" />
            </div>
            MEIOS DE PAGAMENTO
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {config.meiosPagamento.map(s => (
              <Badge key={s} variant="outline" className="gap-1.5 rounded-full px-4 py-1.5 text-xs">
                {s}
                <button onClick={() => removePgto(s)} className="hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={novoPgto} onChange={e => setNovoPgto(e.target.value)} placeholder="Novo meio..." className="flex-1 rounded-xl text-sm" />
            <Button size="sm" onClick={addPgto} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {/* Senhas */}
      <div className="card-editorial overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h3 className="font-display text-lg tracking-wide flex items-center gap-3">
            <div className="icon-circle h-10 w-10 bg-primary/10 text-primary rounded-full">
              <Lock className="h-5 w-5" />
            </div>
            SENHAS DE ACESSO
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground">Altere as senhas de login de cada sócia.</p>
          {sociasList.map(name => {
            const key = `brecho_senha_${name}`;
            return (
              <SenhaField key={name} name={name} storageKey={key} />
            );
          })}
        </div>
      </div>

      <div className="card-editorial overflow-hidden border-destructive/30 border-2">
        <div className="bg-destructive/5 px-6 py-4 border-b border-border">
          <h3 className="font-display text-lg tracking-wide flex items-center gap-3">
            <div className="icon-circle h-10 w-10 bg-destructive/10 text-destructive rounded-full">
              <Database className="h-5 w-5" />
            </div>
            DADOS
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-4">Limpa todos os dados e reimporta os dados iniciais da planilha original.</p>
          <Button variant="destructive" className="rounded-full text-xs" onClick={() => {
            if (confirm('Tem certeza? Todos os dados atuais serão perdidos!')) {
              resetAndReimport();
              window.location.reload();
            }
          }}>
            <RotateCcw className="h-4 w-4 mr-1" /> RESETAR E REIMPORTAR
          </Button>
        </div>
      </div>
    </div>
  );
}
