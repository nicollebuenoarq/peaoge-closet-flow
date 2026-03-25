

## Plano: Limpeza + Layout Editorial em Todas as Paginas

Plano anterior aprovado (deletar cards decorativos, corrigir banner verde, trocar font-mono, esconder navbar no dashboard) + redesign visual das paginas internas para ficarem no nivel do dashboard.

---

### 1. Dashboard — limpeza (do plano anterior)

**`src/pages/Dashboard.tsx`**
- Deletar bloco "DECORATIVE CARDS" (linhas 207-240) — "Moda Circular" e "Flat Lay"
- Banner verde (Previsao): trocar `text-primary-foreground/60` para `text-white/70` nos labels e `text-white` nos valores

### 2. Navbar condicional (do plano anterior)

**`src/components/Layout.tsx`**
- Esconder `<header>` quando `location.pathname === '/'`
- Trocar `font-mono` nos items da nav e user chip para font-body/default

### 3. Fonte Inter em todo o site (do plano anterior)

Remover `font-mono text-xs` de textos corridos (nomes, descricoes, contatos, inputs, botoes) em todas as paginas. Manter Space Mono apenas em: `.label-upper`, `.font-mono-price`, `.pill-badge`, SKUs.

---

### 4. NOVO — Redesign visual das paginas internas

Aplicar o mesmo DNA visual do Dashboard (cores vivas, cards com barra colorida, secoes bem divididas) nas outras 4 paginas.

#### Catalogo (`src/pages/Catalogo.tsx`)

- **Header colorido**: adicionar mini-cards de resumo antes da tabela (estilo dashboard):
  - Total de pecas (icone Package, barra verde)
  - Disponiveis (icone verde)
  - Valor total (icone rosa)
- **Filter bar**: manter como esta, so trocar `font-mono text-xs` para `text-sm` (Inter)
- **Tabela**: manter `table-editorial` mas remover `font-mono text-xs` das celulas de texto (descricao, categoria, fornecedora, tamanho). Manter `font-mono-price` nos precos e `font-mono` nos SKUs
- **Footer da tabela**: adicionar barra de resumo com bg colorido (como no Dashboard)

#### Vendas (`src/pages/Vendas.tsx`)

- **Mini-cards de metricas** antes da tabela (3 cards lado a lado, com barras coloridas):
  - Faturamento (verde)
  - Comissao Fornecedoras (rosa)
  - Parcela Brecho (amarelo)
- **Tabela**: remover `font-mono text-xs` de descricao, fornecedora, compradora. Manter nos precos/SKUs
- **Dialogs**: trocar `font-mono text-xs` dos inputs para `text-sm` (Inter)

#### Fornecedoras (`src/pages/Fornecedoras.tsx`)

- **Mini-cards de resumo** no topo (3 cards):
  - Total fornecedoras (verde)
  - Total pendente (rosa/destructive)
  - Total pago (teal)
- **Cards das fornecedoras**: ja estao bons, so trocar `font-mono` nos textos de contato/chavePix para Inter
- **Detail sheet**: trocar `font-mono` nos textos corridos

#### Configuracoes (`src/pages/Configuracoes.tsx`)

- **Header**: adicionar icone colorido ao lado do titulo (como as outras paginas)
- **Cards**: ja usam `card-editorial` — manter, so trocar `font-mono text-xs` nos inputs e botoes para `text-sm`
- **Labels nos switches**: trocar `font-mono text-xs` para `text-sm`

---

### 5. Memoria

**`mem://index.md`** — atualizar com: cards decorativos removidos, navbar oculta no dashboard, Inter como fonte padrao, mini-cards de metricas como padrao de todas as paginas.

**`mem://removals.md`** — registrar: cards "Moda Circular" e "Flat Lay" removidos.

---

### Arquivos editados

| Arquivo | Mudancas |
|---|---|
| `src/pages/Dashboard.tsx` | Deletar cards decorativos, corrigir banner verde |
| `src/components/Layout.tsx` | Navbar condicional, trocar font-mono |
| `src/pages/Catalogo.tsx` | Mini-cards de resumo, trocar font-mono, Inter nos textos |
| `src/pages/Vendas.tsx` | Mini-cards de metricas, trocar font-mono, Inter nos textos |
| `src/pages/Fornecedoras.tsx` | Mini-cards de resumo, trocar font-mono nos contatos |
| `src/pages/Configuracoes.tsx` | Trocar font-mono nos inputs/labels |
| `mem://index.md` | Atualizar decisoes |
| `mem://removals.md` | Criar registro de remocoes |

