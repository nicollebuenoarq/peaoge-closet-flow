

## Plano de Melhorias para o Brecho Peaoge

Analisei todo o codigo e identifiquei melhorias em 3 categorias: **usabilidade**, **organizacao** e **funcionalidades novas**.

---

### 1. Editar pecas no catalogo (nao so status)

Hoje so da pra mudar o status de uma peca no painel lateral. Vou adicionar edicao completa: descricao, categoria, tamanho, preco, drop e fornecedora. Tambem adicionar botao de excluir peca.

### 2. Editar e excluir vendas

Nao existe forma de corrigir uma venda errada ou excluir. Vou adicionar:
- Botao de editar venda (abre modal pre-preenchido)
- Botao de excluir venda (volta o status da peca para "Disponivel")

### 3. Confirmacoes e feedback visual (toasts)

Nenhuma acao do sistema mostra feedback. Vou adicionar toasts de confirmacao em: salvar peca, registrar venda, marcar como pago, editar fornecedora, etc.

### 4. Dashboard: marcar repasse como pago em lote

Hoje pra marcar pagamento a fornecedora tem que ir venda por venda. Vou adicionar um botao "Pagar Tudo" na tabela de repasses do Dashboard que marca todas as vendas pendentes daquela fornecedora como pagas de uma vez.

### 5. Totalizadores nas tabelas

Adicionar linha de totais no rodape das tabelas de Vendas e Catalogo (total de pecas, faturamento total, comissao total). Facilita a conferencia rapida.

### 6. Ordenacao nas colunas das tabelas

Permitir clicar no cabecalho das colunas para ordenar (por preco, data, SKU, nome). Hoje tudo vem numa ordem fixa.

### 7. Exportar dados (CSV)

Botao "Exportar CSV" nas paginas de Catalogo e Vendas. Gera um arquivo .csv com os dados filtrados para voces abrirem no Excel/Google Sheets.

### 8. Contadores nos filtros

Mostrar a quantidade de resultados ao lado dos filtros (ex: "Disponivel (42)", "Drop 2 (38)") para dar contexto sem precisar contar.

### 9. Melhorar pagina de Fornecedoras

- Adicionar filtro por socia/externa e ativa/inativa
- Mostrar historico resumido: total ja pago vs pendente
- Ao clicar no card da fornecedora, abrir painel com lista das pecas e vendas dela

### 10. Validacoes e protecoes

- Impedir venda com preco final negativo (desconto maior que preco)
- Impedir cadastro de peca sem preco (ou avisar)
- Confirmar antes de mudar status de "Vendido" para outro (pode desconectar da venda)

---

### Detalhes tecnicos

- Toasts via `sonner` (ja instalado no projeto)
- Exportacao CSV usando `Blob` + `URL.createObjectURL` nativo (sem lib extra)
- Ordenacao com estado local `sortBy`/`sortDir` + `.sort()` no array filtrado
- Edicao de peca reutiliza o mesmo Dialog de "Nova Peca" com campos pre-preenchidos
- Pagamento em lote: `store.setVendas()` com map marcando `pagoFornecedora: true` para todas as vendas de uma fornecedora

Todas as mudancas sao no frontend com localStorage, sem necessidade de backend.

