

## Plano: Layout 100% Mobile Friendly

### Problemas identificados

1. **Barras de filtro (Catálogo, Vendas)**: Selects com largura fixa (`w-28`, `w-40`, `w-36`) ficam apertados e fazem overflow horizontal em telas < 400px. Os botões CSV e Nova Peça/Venda também competem por espaço.

2. **Cards mobile do Catálogo sem botão Excluir**: O botão de lixeira só existe no Sheet lateral. No mobile card (linha 478-487) tem "Editar" e "Vender", mas não "Excluir" — o que causou sua confusão original.

3. **Dialogs podem cortar conteúdo**: `DialogContent` com `max-w-md` e padding negativo no header (`-mx-6 -mt-6`) pode causar scroll interno indesejado em telas pequenas. O dialog de venda (Catálogo + Vendas) tem muitos campos.

4. **Dashboard**: Os 5 metric cards em `grid-cols-2` deixam 1 card orphan. A barra de filtro por drop também pode melhorar no mobile.

5. **Configurações**: `grid-cols-2` nos inputs de percentuais fica apertado em telas < 360px.

6. **Títulos**: `text-4xl` / `text-5xl` ocupam muito espaço vertical no mobile.

### Solução por arquivo

| Arquivo | Mudanças |
|---|---|
| `src/pages/Catalogo.tsx` | (1) Filter bar: empilhar selects verticalmente no mobile com `flex-col sm:flex-row` e botões full-width; (2) Adicionar botão Excluir nos mobile cards; (3) Dialog de venda: tornar grid-cols-1 em mobile |
| `src/pages/Vendas.tsx` | (1) Filter bar: mesma abordagem de empilhamento; (2) Dialog nova venda: grid-cols-1 em mobile |
| `src/pages/Dashboard.tsx` | (1) Metric cards: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` → mantém; (2) Filter bar do drop: full-width no select em mobile |
| `src/pages/Fornecedoras.tsx` | Filter bar: empilhar no mobile |
| `src/pages/Configuracoes.tsx` | `grid-cols-1 sm:grid-cols-2` nos inputs de percentuais |
| `src/components/Layout.tsx` | Sem mudanças — nav mobile já funciona |

### Detalhes técnicos

**Filter bars** — Padrão a aplicar em Catálogo, Vendas e Fornecedoras:
```
// Antes:
<div className="filter-bar flex flex-wrap gap-4 items-end">

// Depois:
<div className="filter-bar flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-end">
```
Selects: trocar larguras fixas por `w-full sm:w-32` etc. Botões de ação (CSV, Nova Peça): `w-full sm:w-auto`.

**Botão Excluir no mobile card do Catálogo** — Adicionar ao lado do "Editar":
```tsx
<Button size="sm" variant="outline" 
  className="rounded-full text-xs h-8 text-destructive hover:bg-destructive/10" 
  onClick={() => setShowDeleteConfirm(p)}>
  <Trash2 className="h-3 w-3" />
</Button>
```

**Dialogs** — Adicionar `max-h-[85vh] overflow-y-auto` ao DialogContent e usar `grid-cols-1 sm:grid-cols-2` nos campos internos.

### O que NÃO muda
- Nenhuma lógica de negócio (cálculos, save, delete, SKU)
- Nenhum componente UI base (Dialog, Sheet, Button)
- Layout desktop permanece idêntico
- Nenhuma rota ou estrutura de dados

