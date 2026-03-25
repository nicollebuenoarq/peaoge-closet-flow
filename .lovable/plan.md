

## Plano: Remover scrollbar horizontal das tabelas

### Problema
As tabelas de Catálogo, Vendas e Dashboard têm `overflow-x-auto`, o que cria uma barra de rolagem horizontal ruim para usabilidade.

### Solução
Remover o scroll horizontal e fazer as tabelas caberem na tela com ajustes de layout:

### Mudanças

**1. Catálogo (`src/pages/Catalogo.tsx`)**
- Remover `overflow-x-auto` do wrapper
- Usar `table-fixed` e definir larguras proporcionais nas colunas
- Truncar texto longo (descrição) com `truncate max-w-[...]`
- Reduzir padding das células

**2. Vendas (`src/pages/Vendas.tsx`)**
- Mesma abordagem: remover scroll, `table-fixed`, truncar texto
- Vendas tem 12 colunas — condensar: combinar colunas similares (ex: COM./BRECHÓ), usar abreviações menores

**3. Dashboard (`src/pages/Dashboard.tsx`)**
- Remover `overflow-x-auto` das tabelas de repasses e previsão

**4. Table UI component (`src/components/ui/table.tsx`)**
- Trocar `overflow-auto` por `overflow-hidden` no wrapper padrão

**5. CSS global (`src/index.css`)**
- Adicionar ao `.table-editorial`: `table-layout: fixed` e cells com `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`

### Arquivos
| Arquivo | Mudança |
|---|---|
| `src/index.css` | table-editorial com table-fixed + truncate |
| `src/components/ui/table.tsx` | overflow-hidden |
| `src/pages/Catalogo.tsx` | Remover overflow-x-auto, ajustar larguras |
| `src/pages/Vendas.tsx` | Remover overflow-x-auto, ajustar larguras |
| `src/pages/Dashboard.tsx` | Remover overflow-x-auto |

