

## Corrigir typo no package.json

### Problema
Linha 40 do `package.json` tem um caractere `a` extra após as aspas:
```
"@radix-ui/react-tabs"a: "^1.1.12",
```

Isso invalida o JSON, o `bun install` falha, nenhuma dependência é instalada, e todos os imports dão erro.

### Solução
Remover o `a` extra na linha 40:
```
"@radix-ui/react-tabs": "^1.1.12",
```

### Arquivo
| Arquivo | Ação |
|---|---|
| `package.json` linha 40 | Remover o `a` solto |

Um caractere. Só isso.

