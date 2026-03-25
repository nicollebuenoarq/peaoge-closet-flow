

## Plano: Importar dados da planilha e melhorias

### Dados encontrados na planilha

**Fornecedoras (7)** -- com dados de contato reais:
- Joice: (31) 98368-3967, Pix: 31983683967
- Nicolle: (31) 99377-6577, Pix: 31993776577
- Larissa, Luiza, Luana Otoni, Marcilene, Thaynara (sem contato preenchido)

**Catálogo (114 peças)** -- SKU 1 a 114, distribuidas entre Drop 1, 2 e 3. Algumas peças sem preço ou drop preenchido.

**Vendas (~42 registros)** -- vendas reais de 08/03 (Drop 1) e 15-19/03 (Drop 2), com nomes de compradoras, endereços de entrega, datas de entrega e status de pagamento.

### O que sera feito

**1. Ler a planilha com pandas (via script)**
- Usar pandas para extrair os dados corretos das 3 abas (Fornecedoras, Catalogo, Vendas), ja que o parser de documento perdeu alguns valores de preco.
- Gerar os arrays JSON com todos os dados mapeados para os tipos do sistema.

**2. Atualizar `src/lib/initialData.ts`**
- Substituir as fornecedoras iniciais pelos dados completos (com contato e chave Pix reais).
- Inserir as 114 pecas do catalogo com SKU, descricao, categoria, tamanho, fornecedora, data de entrada, status, preco e drop.
- Pecas que foram vendidas terao status "Vendido".
- Pecas sem preco serao marcadas com preco 0 (para voces preencherem depois).
- Inserir as ~42 vendas com todos os campos: data, SKU, compradora, endereco, pagamento, status de pagamento a fornecedora, etc.
- Configurar `nextSku` para 115 (proximo disponivel).
- Configurar `dropAtual` para 3 (ultimo drop com pecas).

**3. Normalizar categorias**
- A planilha tem categorias inconsistentes (ex: "blusa" vs "Blusa", "short" vs "Short", "calça jeans" vs "calça"). Vou padronizar com primeira letra maiuscula para melhorar os filtros do catalogo.

**4. Adicionar botao "Limpar dados e reimportar"**
- Na pagina de Configuracoes, adicionar um botao que reseta o localStorage e reimporta os dados iniciais da planilha. Util caso voces queiram voltar ao estado original.

### Detalhes tecnicos

- Script Python com pandas le o xlsx e gera os arrays TypeScript.
- Mapeamento fornecedora por nome (ex: "Larissa" -> id "f3") mantendo os IDs existentes.
- Comissoes das vendas calculadas automaticamente com as regras de negocio (60/40, taxa cartao).
- Vendas do Drop 1 marcadas como `pagoFornecedora: true` (conforme planilha mostra "Sim").
- Vendas do Drop 2 marcadas como `pagoFornecedora: false`.

