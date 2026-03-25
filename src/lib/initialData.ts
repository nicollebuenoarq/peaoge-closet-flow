import { Fornecedora, AppConfig } from '@/types';
import { store } from './store';

const fornecedorasIniciais: Fornecedora[] = [
  { id: 'f1', nome: 'Joice', contato: '', chavePix: '', observacoes: 'Sócia', ativa: true, ehSocia: true },
  { id: 'f2', nome: 'Nicolle', contato: '', chavePix: '', observacoes: 'Sócia', ativa: true, ehSocia: true },
  { id: 'f3', nome: 'Larissa', contato: '', chavePix: '', observacoes: 'Sócia', ativa: true, ehSocia: true },
  { id: 'f4', nome: 'Luiza', contato: '', chavePix: '', observacoes: '', ativa: true, ehSocia: false },
  { id: 'f5', nome: 'Luana Otoni', contato: '', chavePix: '', observacoes: '', ativa: true, ehSocia: false },
  { id: 'f6', nome: 'Marcilene', contato: '', chavePix: '', observacoes: '', ativa: true, ehSocia: false },
  { id: 'f7', nome: 'Thaynara', contato: '', chavePix: '', observacoes: '', ativa: true, ehSocia: false },
];

const configInicial: AppConfig = {
  percentualFornecedora: 0.60,
  percentualBrecho: 0.40,
  taxaCartao: 0.05,
  dropAtual: 2,
  statusValidos: ['Disponível', 'Vendido', 'Devolvido', 'Reservado'],
  meiosPagamento: ['Dinheiro', 'Pix', 'Cartão Crédito', 'Cartão Débito', 'Transferência'],
};

export function initializeData() {
  if (!store.isInitialized()) {
    store.setFornecedoras(fornecedorasIniciais);
    store.setPecas([]);
    store.setVendas([]);
    store.setConfig(configInicial);
    store.setNextSku(1);
  }
}
