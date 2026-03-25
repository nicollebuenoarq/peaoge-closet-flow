

## Plano: Melhorias de Layout + Fonte Legivel para Tabelas

Duas frentes: aplicar as melhorias que sugeri antes e trocar a fonte dos dados/tabelas para algo mais legivel.

---

### Problema da fonte

Space Mono e monoespacada -- otima para labels e badges, mas **pessima para leitura de nomes e valores em tabelas**. Os nomes das fornecedoras ("Joice", "Nicolle", "Luana Otoni") ficam cansativos de ler porque cada caractere ocupa o mesmo espaco.

**Solucao:** Adicionar **Inter** como fonte de corpo/leitura. Manter Space Mono apenas para labels, badges e precos. Inter e limpa, moderna e altamente legivel em tamanhos pequenos.

```text
Bebas Neue  → titulos, headings, valores grandes
DM Serif    → destaques italicos
Inter       → corpo, nomes em tabelas, textos corridos
Space Mono  → labels, badges, precos (tabular-nums)
```

---

### Melhorias de layout (as que sugeri antes)

#### 1. Compactar o Hero
- Reduzir padding de `py-14 md:py-20` para `py-8 md:py-12`
- O titulo continua grande mas o bloco ocupa menos espaco vertical

#### 2. Remover sidebar decorativa — tabelas full-width
- Trocar `grid-cols-[1fr_320px]` por coluna unica
- Mover o card rosa e a foto lookbook para **acima** das tabelas, em linha horizontal (2 cards lado a lado, altura menor)
- As tabelas de repasses e previsao ganham largura total

#### 3. Filtro de Drop mais destacado
- Mover o filtro para fora do hero, colocando-o como barra entre o photo strip e os cards de metrica
- Fundo card com borda, mais visivel

#### 4. Botoes "Pagar" maiores
- Aumentar de `h-7 px-3 text-[10px]` para `h-8 px-4 text-xs`
- Mais faceis de clicar

#### 5. Unificar tabelas com abas
- Em vez de duas tabelas separadas (Repasses + Previsao), usar componente Tabs do shadcn
- Aba "Repasses" e aba "Previsao" no mesmo card

---

### Arquivos editados

#### `src/index.css`
- Adicionar import do Inter (Google Fonts)
- Nova variavel `--font-body: 'Inter', sans-serif`
- `body { font-family: var(--font-body) }` em vez de `--font-mono`
- `.font-mono-price` continua com Space Mono
- `.label-upper` continua com Space Mono
- Nomes em tabelas usam Inter naturalmente

#### `tailwind.config.ts`
- Adicionar `body: ['Inter', 'sans-serif']` ao fontFamily

#### `src/pages/Dashboard.tsx`
- Hero: padding reduzido
- Filtro de drop: movido para barra propria entre photo strip e cards
- Layout 2 colunas → coluna unica com cards decorativos em linha acima das tabelas
- Tabelas unificadas com Tabs (Repasses | Previsao)
- Botoes Pagar maiores
- Nomes de fornecedoras sem `font-mono`, usando Inter (classe default do body)

---

### Resultado esperado

- Tabelas muito mais legiveis (Inter para nomes, Space Mono so para numeros)
- Mais espaco horizontal para dados (sem sidebar roubando 320px)
- Hero mais compacto, filtro mais acessivel
- Visual editorial mantido, mas com melhor usabilidade

