export interface Fornecedora {
  id: string;
  nome: string;
  contato: string;
  chavePix: string;
  observacoes: string;
  ativa: boolean;
  ehSocia: boolean;
}

export type StatusPeca = 'Disponível' | 'Vendido' | 'Devolvido' | 'Reservado';

export interface Peca {
  sku: number;
  descricao: string;
  categoria: string;
  tamanho: string;
  fornecedoraId: string;
  dataEntrada: string;
  status: StatusPeca;
  preco: number;
  drop: number;
  foto?: string;
}

export type MeioPagamento = 'Dinheiro' | 'Pix' | 'Cartão Crédito' | 'Cartão Débito' | 'Transferência';

export interface Venda {
  id: string;
  dataVenda: string;
  skuPeca: number;
  descricaoPeca: string;
  fornecedoraId: string;
  drop: number;
  desconto: number;
  precoFinal: number;
  pagamento: MeioPagamento;
  comissaoFornecedora: number;
  parcelaBrecho: number;
  pagoFornecedora: boolean;
  dataPagamento: string | null;
  compradora: string;
  enderecoEntrega: string;
  dataEntrega: string | null;
}

export type Responsavel = 'Nicolle' | 'Larissa' | 'Joice' | 'Todas';

export interface Lembrete {
  id: string;
  titulo: string;
  descricao: string;
  dataLimite: string | null;
  responsavel: Responsavel;
  concluido: boolean;
  criadoEm: string;
}

export interface DropPlan {
  drop: number;
  dataPrevista: string;
  precoMaximo: number;
  metaPecas: number;
  observacoes: string;
}

export interface AppConfig {
  percentualFornecedora: number;
  percentualBrecho: number;
  taxaCartao: number;
  dropAtual: number;
  statusValidos: string[];
  meiosPagamento: string[];
}
