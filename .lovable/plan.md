

## Corrigir: Drop opcional ao cadastrar peça (sem quebrar nada)

### Análise de impacto

Analisei todos os arquivos que usam `.drop`: **Catalogo.tsx**, **Vendas.tsx**, **Dashboard.tsx**, **Planejamento.tsx**, **supabaseStore.ts** e **types/index.ts**. Os pontos que precisam de atenção:

| Local | Uso atual | Risco com `null` | Ação |
|---|---|---|---|
| `Peca.drop` tipo | `number` | Base do problema | Mudar para `number \| null` |
| Catálogo: `formDrop` init | `String(config.dropAtual)` | Preenche automaticamente | Iniciar com `''` |
| Catálogo: save | `parseInt(formDrop) \|\| config.dropAtual` | Fallback impede vazio | Usar `formDrop.trim() ? parseInt(formDrop) : null` |
| Catálogo: edit | `String(p.drop)` | Mostraria "null" | Usar `p.drop != null ? String(p.drop) : ''` |
| Catálogo: sort por drop | `(a[sortBy] as number) - (b[sortBy] as number)` | Crash com null | Tratar null como `0` ou `Infinity` no sort |
| Catálogo: drop filter Set | `pecas.forEach(p => s.add(p.drop))` | Adicionaria null ao Set | Filtrar nulls: `if (p.drop != null) s.add(p.drop)` |
| Catálogo: exibição badge | `D{p.drop}` | Mostraria "Dnull" | Condicional: `p.drop != null ? 'D' + p.drop : '—'` |
| Catálogo: CSV export | `p.drop` na row | Exportaria "null" | Usar `p.drop ?? '—'` |
| Vendas: criar venda | `drop: pecaSelecionada.drop` | Venda herdaria null | OK — `Venda.drop` também precisa aceitar `number \| null` |
| Vendas: drop filter/badge | `v.drop`, `D{v.drop}` | Mostraria "Dnull" | Mesma tratativa |
| Vendas: CSV export | `v.drop` | Exportaria "null" | Usar `v.drop ?? '—'` |
| Dashboard: drop filter Set | `p.drop`, `v.drop` | Adicionaria null | Filtrar nulls |
| Planejamento: contagem | `pecas.filter(p => p.drop === d.drop)` | Peças sem drop não contam | OK — comportamento correto |
| supabaseStore: pecaToDb | `drop: p.drop` | Já funciona | Garantir `p.drop ?? null` |

### Plano de execução

**1. `src/types/index.ts`** — Mudar `drop: number` para `drop: number | null` em `Peca`. Mudar `drop: number` para `drop: number | null` em `Venda`.

**2. `src/lib/supabaseStore.ts`** — Em `pecaToDb`: `drop: p.drop ?? null`. Em `vendaToDb`: `drop: v.drop ?? null`.

**3. `src/pages/Catalogo.tsx`** (maior impacto):
- `openNew`: `setFormDrop('')` em vez de `String(config.dropAtual)`
- `openEdit`: `setFormDrop(p.drop != null ? String(p.drop) : '')`
- `handleSave` (ambos os caminhos): `drop: formDrop.trim() ? parseInt(formDrop) : null`
- Drop Set: `pecas.forEach(p => { if (p.drop != null) s.add(p.drop) })`
- Sort: tratar null como -1 para ficar no início
- Badge: `p.drop != null ? 'D' + p.drop : '—'` (tabela e cards)
- CSV: `p.drop ?? '—'`

**4. `src/pages/Vendas.tsx`**:
- Drop Set: filtrar nulls
- Badge: `v.drop != null ? 'D' + v.drop : '—'`
- CSV: `v.drop ?? '—'`

**5. `src/pages/Dashboard.tsx`**:
- Drop Set: filtrar nulls ao montar opções de filtro

**6. `src/pages/Planejamento.tsx`** — Sem mudanças necessárias (peças sem drop simplesmente não contam para nenhum DropPlan, que é o comportamento correto).

### O que NÃO muda
- Lógica de SKU, cálculos financeiros, comissões
- Tipo `DropPlan` (drops planejados sempre têm número)
- Layout desktop ou mobile
- Fluxo de login, lembretes, configurações, fornecedoras

