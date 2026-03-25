

## Plano: Photo Strip como Header do Dashboard

Remover o hero banner grande ("GESTÃO DE Estilo" + texto fantasma "PEAOGÊ") e deixar apenas o photo strip como cabeçalho visual da página. Simples, bonito e direto ao ponto para um painel de controle interno.

### O que muda

**`src/pages/Dashboard.tsx`**

1. **Remover** toda a section do hero (linhas 110-130) — o bloco com título "GESTÃO DE / Estilo", texto fantasma "PEAOGÊ" e saudação
2. **Manter** o photo strip como primeiro elemento da página
3. Adicionar uma saudação compacta logo abaixo do photo strip (uma linha só): `Olá, {userName} 👋` em texto pequeno, discreto
4. O resto do layout segue igual: filtro de drop → cards de métricas → previsão → cards decorativos → tabelas

### Resultado

O dashboard abre direto com o photo strip navegável no topo, sem aquele bloco enorme de título. Mais limpo, mais funcional, a identidade visual fica nas fotos.

