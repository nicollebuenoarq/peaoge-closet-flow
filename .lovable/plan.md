

## Plano: Redesign Visual Moderno

O site hoje esta funcional mas visualmente "flat" -- tudo tem o mesmo peso visual, sem hierarquia, sem respiro, sem personalidade. Vou transformar ele num visual moderno e elegante, mantendo as cores do brecho mas com muito mais impacto.

---

### 1. Sidebar com glassmorphism e logo destacado

- Sidebar com gradiente sutil (do verde escuro pro verde mais profundo)
- Logo com padding generoso e efeito de brilho sutil
- Itens de nav com transicao suave, icone animado no hover
- Indicador lateral colorido no item ativo (barrinha lateral em vez de so fundo)
- Footer da sidebar com versao estilizada

### 2. Header redesenhado

- Remover o header basico e transformar num breadcrumb elegante com saudacao ("Boa tarde, Peaoge")
- Adicionar data atual estilizada
- Botao de hamburguer com animacao de transicao (menu -> X)

### 3. Cards do Dashboard com gradientes e icones grandes

- Cards de indicadores com gradiente sutil no fundo (cada um com tom diferente baseado na cor do sistema)
- Icones maiores com fundo circular colorido
- Numeros com fonte maior e mais bold
- Sombra suave e hover com elevacao
- Separar visualmente cards de "realizado" vs "previsao" com borda/fundo diferente

### 4. Tabelas modernas

- Linhas com hover mais pronunciado (fundo com cor levemente acentuada)
- Badges de status com cores mais vibrantes e cantos mais arredondados
- Cabecalho da tabela com fundo mais definido e tipografia uppercase pequena
- Botoes de acao com tooltip e transicao suave
- Linhas zebradas suaves para facilitar leitura
- Celulas de preco com destaque tipografico (negrito + cor)

### 5. Filtros redesenhados

- Substituir os filtros soltos por uma barra de filtros unificada com fundo card e padding
- Selects com estilo mais clean
- Botao de busca com icone animado
- Chip/tag mostrando filtros ativos com "x" para remover

### 6. Pagina de Fornecedoras com cards visuais

- Cards com avatar/iniciais coloridas da fornecedora
- Indicador visual de socia (estrela dourada com brilho)
- Barra de progresso visual para "pago vs pendente"
- Hover com sombra elevada e scale sutil

### 7. Dialogs e Sheets mais elegantes

- Dialogs com header colorido (fundo primary)
- Campos de formulario com labels flutuantes ou melhor espacamento
- Botoes com gradiente sutil
- Sheet de detalhes com header fixo bonito

### 8. Animacoes e transicoes

- Fade-in nos cards ao carregar a pagina
- Transicao suave ao trocar filtros
- Hover com scale(1.02) nos cards clicaveis
- Skeleton loading para dados

### 9. Tipografia e espacamento

- Titulos de secao maiores e com mais respiro (mb-6 em vez de mb-4)
- Subtitulos com cor accent
- Labels de filtro com estilo mais discreto
- Numeros financeiros com fonte monospacada

### 10. Empty states e microinteracoes

- Ilustracoes SVG simples para "nenhuma peca encontrada" e "nenhuma venda"
- Icone animado no botao de exportar CSV
- Efeito ripple nos botoes principais

---

### Detalhes tecnicos

- Todas as mudancas sao CSS/Tailwind + pequenos ajustes de JSX
- Adicionar keyframes customizados no `tailwind.config.ts` (fade-in, scale-up)
- Atualizar `src/index.css` com novas utilidades (glassmorphism, gradientes)
- Manter todas as cores HSL existentes, apenas adicionar variacoes com opacidade
- Nenhuma lib nova necessaria -- tudo com Tailwind + CSS nativo
- Arquivos editados: `Layout.tsx`, `Dashboard.tsx`, `Catalogo.tsx`, `Vendas.tsx`, `Fornecedoras.tsx`, `Configuracoes.tsx`, `index.css`, `tailwind.config.ts`

