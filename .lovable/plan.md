

## Plano: Redesign Total -- Novo Layout, Nova Identidade

Vou redesenhar TUDO: layout, navegacao, cores, tipografia, componentes. Nao e um ajuste -- e um site novo com a mesma funcionalidade.

---

### Mudanca de paradigma: Top Navigation + Layout aberto

Trocar a sidebar por um **header fixo com navegacao horizontal**. Isso abre o conteudo, da mais respiro e e mais moderno. A logo fica grande e centralizada no topo.

```text
┌─────────────────────────────────────────────────┐
│  [Logo grande]     Nav: Dashboard Catalogo ...  │
│                                                 │
│  Saudacao + Data                    [Filtros]   │
├─────────────────────────────────────────────────┤
│                                                 │
│              Conteudo principal                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 1. Header/Nav completamente novo

- **Logo grande** no canto esquerdo, sem fundo, limpa (vou remover fundo da imagem via CSS: mix-blend-mode ou fundo transparente)
- Navegacao horizontal com itens estilo pill/tab, hover com fundo suave, ativo com fundo solido coral
- Fundo do header: branco puro com sombra sutil na parte inferior
- No mobile: hamburguer que abre drawer lateral com animacao slide-in
- Saudacao ("Boa tarde, Peaoge") como subtitulo discreto abaixo da nav

### 2. Nova paleta de cores -- alto contraste

Inspirado no mix IceBox (dark/bold) + Desapegae (coral/quente):

- **Background**: creme quente limpo `hsl(40 35% 97%)`
- **Cards**: branco puro `hsl(0 0% 100%)` com sombras reais fortes
- **Primary**: verde muito escuro `hsl(90 35% 18%)` -- profundo e elegante
- **Accent/CTA**: coral vibrante `hsl(350 75% 58%)` -- para botoes, badges, destaques
- **Textos**: quase preto `hsl(90 20% 12%)` para contraste maximo
- **Muted**: cinza-quente suave para textos secundarios

### 3. Tipografia dramatica

- **Playfair Display 3xl-4xl** para titulos de pagina e numeros financeiros grandes
- **Inter** para corpo, labels, tabelas
- Labels em **uppercase, tracking 0.15em, text-xs** 
- Numeros financeiros em **3xl bold** com cor primary nos cards

### 4. Dashboard transformado

- Cards de indicadores: **branco puro, border-radius 1.5rem, sombra forte**
- Cada card com icone grande (48px) em circulo colorido (cor unica por card)
- Numero principal em **3xl-4xl Playfair Display bold**
- Hover: translateY(-6px) + sombra dramatica
- Previsao de faturamento: card com borda coral tracejada e fundo coral/5
- Tabelas de repasses: header com fundo primary escuro e texto branco (invertido)

### 5. Catalogo e Vendas -- tabelas premium

- **Header da tabela**: fundo `primary` (verde escuro) com texto branco
- Linhas com padding generoso `py-4`
- Hover com fundo `accent/8` (coral sutil)
- Badges de status: pills super arredondados (9999px) com cores saturadas
- Precos em tamanho maior, peso bold, cor primary
- Barra de filtros: fundo branco puro, border-radius 1.5rem, sombra, sem glass

### 6. Fornecedoras -- cards grandes e visuais

- Cards com padding `p-6`, border-radius `1.5rem`
- Avatar com fundo de cor **forte** (30-40% opacity, nao 10-15%)
- Hover com `scale(1.03)` + sombra dramatica real
- Badge de socia com fundo coral e estrela dourada
- Barra de progresso mais grossa `h-3` com cor coral

### 7. Dialogs repaginados

- Border-radius `1.5rem`
- Header com fundo primary escuro e texto branco
- Campos com mais espaco entre si `gap-5`
- Botao primario com fundo coral (accent) em vez de verde

### 8. Logo tratada

- Usar `mix-blend-mode: multiply` ou `darken` para remover fundo branco da logo
- Logo com tamanho generoso no header
- Possivel adicionar filtro CSS para harmonizar com a paleta

### 9. Animacoes visiveis

- Fade-in com `translateY(20px)` (mais perceptivel)
- Stagger de `100ms` entre cards
- Transicoes de `300ms` (mais suave)
- Cards clicaveis com `scale(1.03)` no hover
- Botoes com transicao de cor `200ms`

### 10. Configuracoes modernizada

- Cards com icones coloridos em circulos maiores
- Botao de salvar com fundo coral
- Botao destructive com borda vermelha mais forte
- Mais espaco entre secoes

---

### Detalhes tecnicos

**Arquivos editados (todos):**
- `src/index.css` -- paleta nova completa, novas sombras, novos tokens, sem glass
- `tailwind.config.ts` -- border-radius maiores (1.5rem), animacoes mais fortes, cores novas
- `src/components/Layout.tsx` -- **reescrito**: sidebar removida, header horizontal com nav pills, logo grande, mobile drawer
- `src/App.tsx` -- sem mudanca estrutural
- `src/pages/Dashboard.tsx` -- cards com icones grandes 3xl, tabelas com header dark
- `src/pages/Catalogo.tsx` -- filtros solidos, tabela premium, badges pill
- `src/pages/Vendas.tsx` -- mesmas melhorias de tabela
- `src/pages/Fornecedoras.tsx` -- cards grandes, avatares fortes, hover dramatico
- `src/pages/Configuracoes.tsx` -- cards com mais espaco, botoes coral

**Abordagem:** Reescrita do Layout inteiro (sidebar -> top nav). Mudanca real de tokens CSS. Nenhuma lib nova.

