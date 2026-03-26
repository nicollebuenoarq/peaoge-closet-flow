import { useState, useEffect, useCallback } from 'react';
import { supabaseStore } from '@/lib/supabaseStore';
import { supabase } from '@/integrations/supabase/client';
import type { AppConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Settings2, CreditCard, Tags, Lock } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_CONFIG: AppConfig = {
  percentualFornecedora: 0.60,
  percentualBrecho: 0.40,
  taxaCartao: 0.05,
  dropAtual: 2,
  statusValidos: ['Disponível', 'Vendido', 'Devolvido', 'Reservado'],
  meiosPagamento: ['Dinheiro', 'Pix', 'Cartão Crédito', 'Cartão Débito', 'Transferência'],
};

const sociasList = ['Nicolle', 'Larissa', 'Joice'] as const;

export default function Configuracoes() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  const [percForn, setPercForn] = useState(String(DEFAULT_CONFIG.percentualFornecedora * 100));
  const [percBrecho, setPercBrecho] = useState(String(DEFAULT_CONFIG.percentualBrecho * 100));
  const [taxaCartao, setTaxaCartao] = useState(String(DEFAULT_CONFIG.taxaCartao * 100));
  const [dropAtual, setDropAtual] = useState(String(DEFAULT_CONFIG.dropAtual));
  const [novoStatus, setNovoStatus] = useState('');
  const [novoPgto, setNovoPgto] = useState('');

  const loadConfig = useCallback(async () => {
    try {
      const c = await supabaseStore.getConfig();
      setConfig(c);
      setPercForn(String(c.percentualFornecedora * 100));
      setPercBrecho(String(c.percentualBrecho * 100));
      setTaxaCartao(String(c.taxaCartao * 100));
      setDropAtual(String(c.dropAtual));
    } catch (err) {
      console.error('[Configuracoes] Erro ao carregar config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const savePercentuais = async () => {
    try {
      const updated: AppConfig = {
        ...config,
        percentualFornecedora: parseFloat(percForn) / 100,
        percentualBrecho: parseFloat(percBrecho) / 100,
        taxaCartao: parseFloat(taxaCartao) / 100,
        dropAtual: parseInt(dropAtual) || config.dropAtual,
      };
      await supabaseStore.setConfig(updated);
      setConfig(updated);
      toast.success('Configurações salvas');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar configurações');
    }
  };

  const addStatus = async () => {
    if (!novoStatus) return;
    if (config.statusValidos.includes(novoStatus)) { setNovoStatus(''); return; }
    try {
      const updated = { ...config, statusValidos: [...config.statusValidos, novoStatus] };
      await supabaseStore.setConfig(updated);
      setConfig(updated);
      toast.success(`Status "${novoStatus}" adicionado`);
      setNovoStatus('');
    } catch (err) { console.error(err); toast.error('Erro ao adicionar status'); }
  };

  const removeStatus = async (s: string) => {
    try {
      const updated = { ...config, statusValidos: config.statusValidos.filter(x => x !== s) };
      await supabaseStore.setConfig(updated);
      setConfig(updated);
      toast.success(`Status "${s}" removido`);
    } catch (err) { console.error(err); toast.error('Erro ao remover status'); }
  };

  const addPgto = async () => {
    if (!novoPgto) return;
    if (config.meiosPagamento.includes(novoPgto)) { setNovoPgto(''); return; }
    try {
      const updated = { ...config, meiosPagamento: [...config.meiosPagamento, novoPgto] };
      await supabaseStore.setConfig(updated);
      setConfig(updated);
      toast.success(`Meio de pagamento "${novoPgto}" adicionado`);
      setNovoPgto('');
    } catch (err) { console.error(err); toast.error('Erro ao adicionar meio'); }
  };

  const removePgto = async (s: string) => {
    try {
      const updated = { ...config, meiosPagamento: config.meiosPagamento.filter(x => x !== s) };
      await supabaseStore.setConfig(updated);
      setConfig(updated);
      toast.success(`Meio "${s}" removido`);
    } catch (err) { console.error(err); toast.error('Erro ao remover meio'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-muted-foreground text-sm animate-pulse">Carregando configurações...</p>
    </div>
  );

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
          <p className="text-xs text-muted-foreground">Altere a senha da sua própria conta.</p>
          {sociasList.map(name => (
            <SenhaField key={name} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SenhaField({ name }: { name: string }) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!value.trim() || value.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? '';
      if (!email.toLowerCase().startsWith(name.toLowerCase())) {
        toast.error('Você só pode alterar sua própria senha');
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: value });
      if (error) throw error;
      setValue('');
      toast.success(`Senha de ${name} atualizada`);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao atualizar senha: ' + (err?.message ?? 'Desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-sm tracking-wide text-primary w-20">{name}</span>
      <Input
        type="password"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Nova senha..."
        className="flex-1 rounded-xl text-sm"
      />
      <Button size="sm" onClick={save} disabled={loading} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs">
        <Save className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
    }
