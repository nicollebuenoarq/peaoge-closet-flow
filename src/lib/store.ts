import { Fornecedora, Peca, Venda, AppConfig } from '@/types';

const KEYS = {
  fornecedoras: 'brecho_fornecedoras',
  pecas: 'brecho_pecas',
  vendas: 'brecho_vendas',
  config: 'brecho_config',
  nextSku: 'brecho_next_sku',
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const store = {
  getFornecedoras: (): Fornecedora[] => get(KEYS.fornecedoras, []),
  setFornecedoras: (d: Fornecedora[]) => set(KEYS.fornecedoras, d),

  getPecas: (): Peca[] => get(KEYS.pecas, []),
  setPecas: (d: Peca[]) => set(KEYS.pecas, d),

  getVendas: (): Venda[] => get(KEYS.vendas, []),
  setVendas: (d: Venda[]) => set(KEYS.vendas, d),

  getConfig: (): AppConfig => get(KEYS.config, {
    percentualFornecedora: 0.60,
    percentualBrecho: 0.40,
    taxaCartao: 0.05,
    dropAtual: 2,
    statusValidos: ['Disponível', 'Vendido', 'Devolvido', 'Reservado'],
    meiosPagamento: ['Dinheiro', 'Pix', 'Cartão Crédito', 'Cartão Débito', 'Transferência'],
  }),
  setConfig: (d: AppConfig) => set(KEYS.config, d),

  getNextSku: (): number => get(KEYS.nextSku, 1),
  setNextSku: (n: number) => set(KEYS.nextSku, n),

  isInitialized: (): boolean => localStorage.getItem(KEYS.fornecedoras) !== null,
};
