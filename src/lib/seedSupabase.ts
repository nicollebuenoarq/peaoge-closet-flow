import { supabaseStore } from './supabaseStore';
import { Peca, Venda, AppConfig } from '@/types';
import type { Fornecedora } from '@/types';

const fornecedorasIniciais: Fornecedora[] = [
  { id: 'f1', nome: 'Joice',       contato: '(31) 98368-3967', chavePix: '31983683967', observacoes: 'Socia', ativa: true, ehSocia: true },
  { id: 'f2', nome: 'Nicolle',     contato: '(31) 99377-6577', chavePix: '31993776577', observacoes: 'Socia', ativa: true, ehSocia: true },
  { id: 'f3', nome: 'Larissa',     contato: '', chavePix: '', observacoes: 'Socia', ativa: true, ehSocia: true },
  { id: 'f4', nome: 'Luiza',       contato: '', chavePix: '', observacoes: '', ativa: true, ehSocia: false },
  { id: 'f5', nome: 'Luana Otoni', contato: '', chavePix: '', observacoes: '', ativa: true, ehSocia: false },
  { id: 'f6', nome: 'Marcilene',   contato: '', chavePix: '', observacoes: '', ativa: true, ehSocia: false },
  { id: 'f7', nome: 'Thaynara',    contato: '', chavePix: '', observacoes: '', ativa: true, ehSocia: false },
];

const configInicial: AppConfig = {
  percentualFornecedora: 0.60,
  percentualBrecho: 0.40,
  taxaCartao: 0.05,
  dropAtual: 3,
  statusValidos: ['Disponivel', 'Vendido', 'Devolvido', 'Reservado'],
  meiosPagamento: ['Dinheiro', 'Pix', 'Cartao Credito', 'Cartao Debito', 'Transferencia'],
};

export async function seedSupabase(pecas: Peca[], vendas: Venda[]) {
  const initialized = await supabaseStore.isInitialized();
  if (initialized) {
    console.log('[seedSupabase] Banco ja populado.');
    return;
  }
  await supabaseStore.setFornecedoras(fornecedorasIniciais);
  await supabaseStore.setPecas(pecas);
  await supabaseStore.setVendas(vendas);
  await supabaseStore.setConfig(configInicial);
  await supabaseStore.setNextSku(115);
  console.log('[seedSupabase] Banco populado com sucesso!');
}
