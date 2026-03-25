

## Plano: Multi-responsável nos lembretes + corrigir filtro

### Problema
1. O filtro de responsável tem "Todas as sócias" E "Todas" — duplicado
2. Não é possível marcar 2 responsáveis num lembrete (ex: Nicolle + Larissa)

### Mudanças

**1. Tipo (`src/types/index.ts`)**
- Mudar `responsavel: Responsavel` para `responsavel: Responsavel[]` no `Lembrete`

**2. Formulário de lembrete (`src/pages/Planejamento.tsx`)**
- Trocar o Select de responsável por **checkboxes** (Nicolle, Larissa, Joice, Todas). Ao marcar "Todas", desmarca as individuais e vice-versa
- Estado `lResponsavel` passa de string para `Responsavel[]`
- No filtro do toolbar: remover "Todas as sócias", deixar apenas as 4 opções (Nicolle, Larissa, Joice, Todas) + um item "Todos" como valor de reset do filtro
- Atualizar `saveLembrete` para salvar array
- Atualizar `LembreteCard` para mostrar múltiplos badges
- Atualizar `filteredLembretes` para filtrar por `l.responsavel.includes(filtroResp)`

**3. Pop-up (`src/components/LembretesPopup.tsx`)**
- Ajustar filtro: `l.responsavel.includes(userName) || l.responsavel.includes('Todas')`

**4. Migração de dados**
- No store getter, converter dados antigos (string) para array automaticamente para não quebrar dados existentes

### Arquivos
| Arquivo | Mudança |
|---|---|
| `src/types/index.ts` | `responsavel: Responsavel[]` |
| `src/pages/Planejamento.tsx` | Checkboxes multi-select, corrigir filtro, badges múltiplos |
| `src/components/LembretesPopup.tsx` | Filtro com array |
| `src/lib/store.ts` | Migração string→array no getter |

