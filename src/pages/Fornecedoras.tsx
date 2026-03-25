import { useState } from 'react';
import { store } from '@/lib/store';
import { Fornecedora } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Star } from 'lucide-react';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Fornecedoras() {
  const [, setTick] = useState(0);
  const reload = () => setTick(t => t + 1);

  const fornecedoras = store.getFornecedoras();
  const pecas = store.getPecas();
  const vendas = store.getVendas();
  const config = store.getConfig();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Fornecedora | null>(null);

  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [ativa, setAtiva] = useState(true);
  const [ehSocia, setEhSocia] = useState(false);

  const openNew = () => {
    setEditing(null);
    setNome(''); setContato(''); setChavePix(''); setObservacoes(''); setAtiva(true); setEhSocia(false);
    setShowForm(true);
  };

  const openEdit = (f: Fornecedora) => {
    setEditing(f);
    setNome(f.nome); setContato(f.contato); setChavePix(f.chavePix); setObservacoes(f.observacoes); setAtiva(f.ativa); setEhSocia(f.ehSocia);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editing) {
      const all = fornecedoras.map(f => f.id === editing.id ? { ...f, nome, contato, chavePix, observacoes, ativa, ehSocia } : f);
      store.setFornecedoras(all);
    } else {
      const nova: Fornecedora = { id: crypto.randomUUID(), nome, contato, chavePix, observacoes, ativa, ehSocia };
      store.setFornecedoras([...fornecedoras, nova]);
    }
    setShowForm(false);
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{fornecedoras.length} fornecedoras cadastradas</p>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nova Fornecedora</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {fornecedoras.map(f => {
          const totalPecas = pecas.filter(p => p.fornecedoraId === f.id).length;
          const vendasF = vendas.filter(v => v.fornecedoraId === f.id);
          const totalVendido = vendasF.reduce((s, v) => s + v.precoFinal, 0);
          const totalReceber = vendasF.filter(v => !v.pagoFornecedora).reduce((s, v) => s + v.comissaoFornecedora, 0);

          return (
            <Card key={f.id} className={!f.ativa ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                      {f.nome}
                      {f.ehSocia && <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs"><Star className="h-3 w-3 mr-0.5" /> Sócia</Badge>}
                    </h3>
                    {!f.ativa && <Badge variant="outline" className="text-xs mt-1">Inativa</Badge>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(f)}><Edit className="h-4 w-4" /></Button>
                </div>
                {f.contato && <p className="text-sm text-muted-foreground">📱 {f.contato}</p>}
                {f.chavePix && <p className="text-sm text-muted-foreground">🔑 {f.chavePix}</p>}
                {f.observacoes && <p className="text-sm text-muted-foreground mt-1">{f.observacoes}</p>}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                  <div><p className="text-xs text-muted-foreground">Peças</p><p className="font-bold">{totalPecas}</p></div>
                  <div><p className="text-xs text-muted-foreground">Vendido</p><p className="font-bold text-sm">{fmt(totalVendido)}</p></div>
                  <div><p className="text-xs text-muted-foreground">A Receber</p><p className="font-bold text-sm">{fmt(totalReceber)}</p></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-heading">{editing ? 'Editar' : 'Nova'} Fornecedora</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome</Label><Input value={nome} onChange={e => setNome(e.target.value)} /></div>
            <div><Label>Contato (telefone)</Label><Input value={contato} onChange={e => setContato(e.target.value)} /></div>
            <div><Label>Chave Pix</Label><Input value={chavePix} onChange={e => setChavePix(e.target.value)} /></div>
            <div><Label>Observações</Label><Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} /></div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={ativa} onCheckedChange={setAtiva} /><Label>Ativa</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={ehSocia} onCheckedChange={setEhSocia} /><Label>Sócia</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!nome}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
