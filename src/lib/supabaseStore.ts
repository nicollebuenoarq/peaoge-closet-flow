// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';
import { Fornecedora, Peca, Venda, AppConfig, Lembrete, DropPlan } from '@/types';

// ─── Mapeamento DB → camelCase ───────────────────────────────────────────────

function dbToFornecedora(row: any): Fornecedora {
      return {
              id: row.id,
              nome: row.nome,
              contato: row.contato ?? '',
              chavePix: row.chave_pix ?? '',
              observacoes: row.observacoes ?? '',
              ativa: row.ativa ?? true,
              ehSocia: row.eh_socia ?? false,
      };
}

function fornecedoraToDb(f: Fornecedora) {
      return {
              id: f.id,
              nome: f.nome,
              contato: f.contato,
              chave_pix: f.chavePix,
              observacoes: f.observacoes,
              ativa: f.ativa,
              eh_socia: f.ehSocia,
      };
}

function dbToPeca(row: any): Peca {
      return {
              sku: row.sku,
              descricao: row.descricao,
              categoria: row.categoria ?? '',
              tamanho: row.tamanho ?? '',
              fornecedoraId: row.fornecedora_id,
              dataEntrada: row.data_entrada ?? '',
              status: row.status,
              preco: Number(row.preco),
              drop: row.drop,
              foto: row.foto ?? undefined,
      };
}

function pecaToDb(p: Peca) {
      return {
              sku: p.sku,
              descricao: p.descricao,
              categoria: p.categoria,
              tamanho: p.tamanho,
              fornecedora_id: p.fornecedoraId,
              data_entrada: p.dataEntrada,
              status: p.status,
              preco: p.preco,
              drop: p.drop,
              foto: p.foto ?? null,
      };
}

function dbToVenda(row: any): Venda {
      return {
              id: row.id,
              dataVenda: row.data_venda,
              skuPeca: row.sku_peca,
              descricaoPeca: row.descricao_peca ?? '',
              fornecedoraId: row.fornecedora_id,
              drop: row.drop,
              desconto: Number(row.desconto),
              precoFinal: Number(row.preco_final),
              pagamento: row.pagamento,
              comissaoFornecedora: Number(row.comissao_fornecedora),
              parcelaBrecho: Number(row.parcela_brecho),
              pagoFornecedora: row.pago_fornecedora ?? false,
              dataPagamento: row.data_pagamento ?? null,
              compradora: row.compradora ?? '',
              enderecoEntrega: row.endereco_entrega ?? '',
              dataEntrega: row.data_entrega ?? null,
      };
}

function vendaToDb(v: Venda) {
      return {
              id: v.id,
              data_venda: v.dataVenda,
              sku_peca: v.skuPeca,
              descricao_peca: v.descricaoPeca,
              fornecedora_id: v.fornecedoraId,
              drop: v.drop,
              desconto: v.desconto,
              preco_final: v.precoFinal,
              pagamento: v.pagamento,
              comissao_fornecedora: v.comissaoFornecedora,
              parcela_brecho: v.parcelaBrecho,
              pago_fornecedora: v.pagoFornecedora,
              data_pagamento: v.dataPagamento ?? null,
              compradora: v.compradora,
              endereco_entrega: v.enderecoEntrega,
              data_entrega: v.dataEntrega ?? null,
      };
}

function dbToLembrete(row: any): Lembrete {
      const resp = Array.isArray(row.responsavel) ? row.responsavel : [row.responsavel];
      return {
              id: row.id,
              titulo: row.titulo,
              descricao: row.descricao ?? '',
              dataLimite: row.data_limite ?? null,
              responsavel: resp,
              concluido: row.concluido ?? false,
              criadoEm: row.criado_em,
      };
}

function lembreteToDb(l: Lembrete) {
      return {
              id: l.id,
              titulo: l.titulo,
              descricao: l.descricao,
              data_limite: l.dataLimite ?? null,
              responsavel: l.responsavel,
              concluido: l.concluido,
              criado_em: l.criadoEm,
      };
}

function dbToDropPlan(row: any): DropPlan {
      return {
              drop: row.drop,
              dataPrevista: row.data_prevista ?? '',
              precoMaximo: Number(row.preco_maximo),
              metaPecas: row.meta_pecas,
              observacoes: row.observacoes ?? '',
      };
}

function dropPlanToDb(d: DropPlan) {
      return {
              drop: d.drop,
              data_prevista: d.dataPrevista,
              preco_maximo: d.precoMaximo,
              meta_pecas: d.metaPecas,
              observacoes: d.observacoes,
      };
}

const DEFAULT_CONFIG: AppConfig = {
      percentualFornecedora: 0.60,
      percentualBrecho: 0.40,
      taxaCartao: 0.05,
      dropAtual: 2,
      statusValidos: ['Disponível', 'Vendido', 'Devolvido', 'Reservado'],
      meiosPagamento: ['Dinheiro', 'Pix', 'Cartão Crédito', 'Cartão Débito', 'Transferência'],
};

function dbToConfig(row: any): AppConfig {
      return {
              percentualFornecedora: Number(row.percentual_fornecedora),
              percentualBrecho: Number(row.percentual_brecho),
              taxaCartao: Number(row.taxa_cartao),
              dropAtual: row.drop_atual,
              statusValidos: row.status_validos ?? DEFAULT_CONFIG.statusValidos,
              meiosPagamento: row.meios_pagamento ?? DEFAULT_CONFIG.meiosPagamento,
      };
}

function configToDb(c: AppConfig, nextSku?: number) {
      return {
              id: 1,
              percentual_fornecedora: c.percentualFornecedora,
              percentual_brecho: c.percentualBrecho,
              taxa_cartao: c.taxaCartao,
              drop_atual: c.dropAtual,
              status_validos: c.statusValidos,
              meios_pagamento: c.meiosPagamento,
              ...(nextSku !== undefined ? { next_sku: nextSku } : {}),
              updated_at: new Date().toISOString(),
      };
}

// ─── Store assíncrono ────────────────────────────────────────────────────────

// Helper para acessar tabelas sem tipos gerados
const db = (table: string) => (supabase as any).from(table);

export const supabaseStore = {

      // FORNECEDORAS
      async getFornecedoras(): Promise<Fornecedora[]> {
              const { data, error } = await db('fornecedoras').select('*').order('nome');
              if (error) throw error;
              return ((data as any[]) ?? []).map(dbToFornecedora);
      },
      async setFornecedoras(list: Fornecedora[]): Promise<void> {
              const { error } = await db('fornecedoras').upsert(list.map(fornecedoraToDb));
              if (error) throw error;
      },
      async upsertFornecedora(f: Fornecedora): Promise<void> {
              const { error } = await db('fornecedoras').upsert(fornecedoraToDb(f));
              if (error) throw error;
      },
      async deleteFornecedora(id: string): Promise<void> {
              const { error } = await db('fornecedoras').delete().eq('id', id);
              if (error) throw error;
      },

      // PECAS
      async getPecas(): Promise<Peca[]> {
              const { data, error } = await db('pecas').select('*').order('sku');
              if (error) throw error;
              return ((data as any[]) ?? []).map(dbToPeca);
      },
      async setPecas(list: Peca[]): Promise<void> {
              const { error } = await db('pecas').upsert(list.map(pecaToDb));
              if (error) throw error;
      },
      async upsertPeca(p: Peca): Promise<void> {
              const { error } = await db('pecas').upsert(pecaToDb(p));
              if (error) throw error;
      },
      async deletePeca(sku: number): Promise<void> {
              const { error } = await db('pecas').delete().eq('sku', sku);
              if (error) throw error;
      },

      // VENDAS
      async getVendas(): Promise<Venda[]> {
              const { data, error } = await db('vendas').select('*').order('data_venda');
              if (error) throw error;
              return ((data as any[]) ?? []).map(dbToVenda);
      },
      async setVendas(list: Venda[]): Promise<void> {
              const { error } = await db('vendas').upsert(list.map(vendaToDb));
              if (error) throw error;
      },
      async upsertVenda(v: Venda): Promise<void> {
              const { error } = await db('vendas').upsert(vendaToDb(v));
              if (error) throw error;
      },
      async deleteVenda(id: string): Promise<void> {
              const { error } = await db('vendas').delete().eq('id', id);
              if (error) throw error;
      },

      // LEMBRETES
      async getLembretes(): Promise<Lembrete[]> {
              const { data, error } = await db('lembretes').select('*').order('criado_em');
              if (error) throw error;
              return ((data as any[]) ?? []).map(dbToLembrete);
      },
      async setLembretes(list: Lembrete[]): Promise<void> {
              const { error } = await db('lembretes').upsert(list.map(lembreteToDb));
              if (error) throw error;
      },
      async upsertLembrete(l: Lembrete): Promise<void> {
              const { error } = await db('lembretes').upsert(lembreteToDb(l));
              if (error) throw error;
      },
      async deleteLembrete(id: string): Promise<void> {
              const { error } = await db('lembretes').delete().eq('id', id);
              if (error) throw error;
      },

      // DROP PLANS
      async getDropPlans(): Promise<DropPlan[]> {
              const { data, error } = await db('drop_plans').select('*').order('drop');
              if (error) throw error;
              return ((data as any[]) ?? []).map(dbToDropPlan);
      },
      async setDropPlans(list: DropPlan[]): Promise<void> {
              const { error } = await db('drop_plans').upsert(list.map(dropPlanToDb));
              if (error) throw error;
      },
      async upsertDropPlan(d: DropPlan): Promise<void> {
              const { error } = await db('drop_plans').upsert(dropPlanToDb(d));
              if (error) throw error;
      },
      async deleteDropPlan(drop: number): Promise<void> {
              const { error } = await db('drop_plans').delete().eq('drop', drop);
              if (error) throw error;
      },

      // CONFIG
      async getConfig(): Promise<AppConfig> {
              const { data, error } = await db('config').select('*').eq('id', 1).single();
              if (error || !data) return DEFAULT_CONFIG;
              return dbToConfig(data as any);
      },
      async setConfig(c: AppConfig): Promise<void> {
              const { error } = await db('config').upsert(configToDb(c));
              if (error) throw error;
      },

      // NEXT SKU
      async getNextSku(): Promise<number> {
              const { data, error } = await db('config').select('next_sku').eq('id', 1).single();
              if (error || !data) return 1;
              return (data as any).next_sku ?? 1;
      },
      async setNextSku(n: number): Promise<void> {
              const { error } = await db('config').upsert({
                        id: 1,
                        next_sku: n,
                        updated_at: new Date().toISOString(),
              });
              if (error) throw error;
      },

      // INIT CHECK
      async isInitialized(): Promise<boolean> {
              const { count, error } = await db('fornecedoras')
                .select('id', { count: 'exact', head: true });
              if (error) return false;
              return (count ?? 0) > 0;
      },
};
