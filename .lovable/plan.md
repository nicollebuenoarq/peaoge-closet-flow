

## Plano: Adaptar o site para mobile

### Problema principal
As tabelas de Catálogo (10 colunas) e Vendas (13 colunas) são impossíveis de ler no celular. O photo strip do Dashboard com 5 fotos fica minúsculo. Os cards de métricas e filtros ficam apertados.

### Mudanças por página

**1. Dashboard (`src/pages/Dashboard.tsx`)**
- Photo strip: `grid-cols-5` apenas em `md+`. No mobile, mostrar como scroll horizontal ou `grid-cols-3` com as 2 últimas escondidas
- Metric cards: já tem `grid-cols-2 md:grid-cols-3 lg:grid-cols-5` — ok
- Forecast card: `grid-cols-1` no mobile em vez de `grid-cols-3`
- Tabelas de repasses/previsão: mostrar como **cards empilhados** no mobile (`md:hidden` / `hidden md:block`)

**2. Catálogo (`src/pages/Catalogo.tsx`)**
- Summary cards: `grid-cols-1 sm:grid-cols-3` 
- Filter bar: já é flex-wrap — ok, mas reduzir `min-w` do campo busca
- **Tabela → Cards no mobile**: No mobile, cada peça vira um card compacto com SKU, descrição, status badge, preço, fornecedora. A tabela fica `hidden md:block` e os cards `md:hidden`
- Botão de ações (vender/editar/excluir) acessível no card

**3. Vendas (`src/pages/Vendas.tsx`)**
- Mesma abordagem: tabela escondida no mobile, cards empilhados com info essencial (data, SKU, descrição, preço, status pago, ações)

**4. Fornecedoras (`src/pages/Fornecedoras.tsx`)**
- Grid de cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (já é quase isso)
- Summary cards: `grid-cols-1 sm:grid-cols-3`

**5. Login (`src/pages/Login.tsx`)**
- Já funciona bem no mobile (lado esquerdo escondido com `hidden lg:flex`)

**6. Layout (`src/components/Layout.tsx`)**
- Já tem hamburger mobile — ok
- Reduzir padding do main em mobile

### Componente reutilizável
Criar um componente `MobileCard` genérico não vale a pena — cada página tem dados diferentes. Melhor fazer inline com `md:hidden` / `hidden md:block`.

### Arquivos a editar
| Arquivo | Mudança |
|---|---|
| `src/pages/Dashboard.tsx` | Photo strip responsivo, forecast cols, tabelas → cards mobile |
| `src/pages/Catalogo.tsx` | Summary cards responsivo, tabela → cards mobile |
| `src/pages/Vendas.tsx` | Tabela → cards mobile |
| `src/pages/Fornecedoras.tsx` | Summary cards responsivo |
| `src/components/Layout.tsx` | Padding mobile menor |

