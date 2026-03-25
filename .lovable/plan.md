

## Plano: Lembretes + Planejamento de Drops

### Resumo
Nova página **PLANEJAMENTO** com sistema de lembretes por sócia (com pop-up no login) e planejamento de drops futuros. A foto enviada será usada no photo strip do Dashboard.

### Mudanças

**1. Foto (`src/assets/photos/flatlay_edited.jpg`)**
- Copiar a foto enviada para assets

**2. Tipos (`src/types/index.ts`)**
- Adicionar `Lembrete`: id, titulo, descricao, dataLimite?, responsavel (`'Nicolle'|'Larissa'|'Joice'|'Todas'`), concluido, criadoEm
- Adicionar `DropPlan`: drop, dataPrevista, precoMaximo, metaPecas, observacoes

**3. Store (`src/lib/store.ts`)**
- get/set para `brecho_lembretes` e `brecho_drop_plans`

**4. Página Planejamento (`src/pages/Planejamento.tsx`)**
- Duas abas: **Lembretes** e **Drops**
- Lembretes: criar, editar, concluir, excluir. Filtro por responsável. Cards com título, descrição, data limite, badge de responsável
- Drops: criar/editar planos de drop com número, data prevista, preço máximo, meta de peças, observações. Card mostra progresso (peças cadastradas vs meta via catálogo)
- Mobile-first com cards responsivos

**5. Pop-up de Lembretes (`src/components/LembretesPopup.tsx`)**
- Dialog que aparece ao montar o Layout
- Filtra lembretes pendentes onde `responsavel === userName || responsavel === 'Todas'`
- Mostra lista com botão "✓ Entendido" que marca como visto na sessão (sessionStorage)
- Se não há lembretes pendentes, não aparece

**6. Layout (`src/components/Layout.tsx`)**
- Adicionar item "PLANEJAMENTO" no nav (ícone `ClipboardList`) entre Fornecedoras e Configurações
- Importar e renderizar `<LembretesPopup />` dentro do layout

**7. Dashboard (`src/pages/Dashboard.tsx`)**
- Adicionar 6º item no photoStrip com a foto nova, label "PLANEJAMENTO", path `/planejamento`
- Ajustar grid para `md:grid-cols-6`

**8. Rota (`src/App.tsx`)**
- Adicionar `<Route path="/planejamento" element={<Planejamento />} />`

### Arquivos
| Arquivo | Ação |
|---|---|
| `src/assets/photos/flatlay_edited.jpg` | Copiar foto |
| `src/types/index.ts` | Adicionar Lembrete + DropPlan |
| `src/lib/store.ts` | get/set lembretes e dropPlans |
| `src/pages/Planejamento.tsx` | Nova página |
| `src/components/LembretesPopup.tsx` | Novo componente pop-up |
| `src/components/Layout.tsx` | Nav item + popup |
| `src/pages/Dashboard.tsx` | Photo strip 6 itens |
| `src/App.tsx` | Nova rota |

