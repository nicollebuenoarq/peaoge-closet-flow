

## Plano: Photo Strip como Navegacao por Categorias

Transformar o photo strip decorativo em navegacao funcional, onde cada foto representa uma pagina do sistema. As fotos viram atalhos visuais clicaveis.

### Mapeamento foto → pagina

```text
saia_xadrez_edit    → DASHBOARD     → /
flatlay2_edit       → CATALOGO      → /catalogo
shorts_jeans_edit   → VENDAS        → /vendas
looks_cabide_edit   → FORNECEDORAS  → /fornecedoras
camisetas_rosa_edit → CONFIG        → /configuracoes
```

### Mudancas

#### `src/pages/Dashboard.tsx`

1. Importar `useNavigate` do react-router-dom
2. Trocar o array `photoStrip` para incluir label da pagina e path:
   - `{ src: saiaXadrez, label: 'DASHBOARD', path: '/' }`
   - `{ src: flatlay2, label: 'CATÁLOGO', path: '/catalogo' }`
   - `{ src: shortsJeans, label: 'VENDAS', path: '/vendas' }`
   - `{ src: looksCabide, label: 'FORNECEDORAS', path: '/fornecedoras' }`
   - `{ src: camisetasRosa, label: 'CONFIG', path: '/configuracoes' }`
3. Cada item do photo strip vira clicavel (`onClick → navigate(path)`)
4. Highlight visual na pagina ativa (borda inferior rosa ou overlay mais claro)
5. Cursor pointer ja esta, adicionar transicao de escala no hover

#### Melhorias extras (minhas sugestoes)

- **Barra colorida embaixo de cada foto** (mesmas cores dos cards de metrica) para criar conexao visual entre o strip e os cards abaixo
- **Label ativo em rosa** quando a foto corresponde a pagina atual (no caso do Dashboard, a primeira foto fica destacada)
- **Overlay escuro reduzido** na foto ativa para ela "brilhar" mais que as outras

### Detalhes tecnicos

- Unico arquivo editado: `src/pages/Dashboard.tsx`
- Sem libs novas, apenas `useNavigate` que ja esta disponivel no projeto
- A logica funcional do dashboard permanece intacta

