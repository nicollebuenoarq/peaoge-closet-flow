

## Plano: Redesign Editorial Y2K -- Brecho Peaoge

Redesign completo com estetica editorial/Y2K, novas fontes, nova paleta, photo strip, hero banner, login page, e grain overlay.

---

### Visao geral do novo layout

```text
┌─────────────────────────────────────────────────┐
│ [Logo -3°]   Dashboard Catalogo Vendas ...  [P] │  <- Navbar creme
├─────────────────────────────────────────────────┤
│  GESTAO DE                    [Filtro Drop]     │
│  *Estilo*            "PEAOGE" fantasma atras    │  <- Hero banner
├────┬────┬────┬────┬────┤                        │
│SAIA│CASUAL│JEANS│LOOKS│CAMISETAS│                │  <- Photo strip
├─────────────────────────────────────────────────┤
│ [Card][Card][Card][Card][Card]  │  [Card Rosa]  │
│                                 │  [Foto+Label] │  <- Metricas + lateral
│ Tabela de Repasses              │               │
│ Previsao por Fornecedora        │               │
└──────────────── Logo marca dagua 15% ───────────┘
```

---

### Arquivos e mudancas

#### 1. Copiar assets (7 imagens + logo)
- Copiar `logo_peaoge_sem_fundo.png` para `src/assets/`
- Copiar 6 fotos editadas para `src/assets/photos/`

#### 2. `src/index.css` -- Design system completo novo
- Fontes: Bebas Neue, DM Serif Display, Space Mono (Google Fonts import)
- Paleta: `--background: #f5f0e8`, `--primary: #2d4a2e`, `--accent: #e8527a`, `--accent-light: #f7b8cc`, `--foreground: #111111`, `--primary-medium: #4a7a4b`
- Grain overlay via `::after` no body com SVG noise pattern, opacity 2.5%, pointer-events none, fixed
- Remover todas as utilidades antigas (card-modern, table-premium, etc)
- Novas utilidades:
  - `.font-display` (Bebas Neue), `.font-serif` (DM Serif Display), `.font-mono` (Space Mono)
  - `.label-upper` em Space Mono uppercase tracking wide
  - `.card-editorial` com border-radius 16px, border sutil, sem sombra pesada
  - Animacoes fadeUp com stagger

#### 3. `tailwind.config.ts` -- Tokens novos
- fontFamily: display (Bebas Neue), serif (DM Serif Display), mono (Space Mono)
- Cores novas mapeadas para os tokens CSS
- Border-radius 16px como padrao
- Animacoes fade-up customizadas

#### 4. `src/components/Layout.tsx` -- Reescrita completa
- **Navbar**: fundo `#f5f0e8`, logo com cores originais h-[52px] rotate-[-3deg], nav links em verde escuro, link ativo com bg rosa `#e8527a` e texto branco (pill), chip do usuario com inicial colorida no canto direito
- **Sem hero/greeting global** -- o hero fica DENTRO do Dashboard
- **Footer**: logo como marca dagua 80px rotate-[8deg] opacity-15
- Mobile: hamburger abre drawer com mesma estetica

#### 5. `src/pages/Dashboard.tsx` -- Redesign total
Secoes de cima pra baixo:

**Hero Banner**:
- Texto fantasma "PEAOGE" em Bebas Neue ~150px, cor verde, opacity 6%, position absolute
- Titulo "GESTAO DE" em Bebas Neue verde + "*Estilo*" em DM Serif Display italic rosa
- Filtro de drop no canto direito do hero
- Fundo creme, sem borda

**Photo Strip**:
- 5 colunas, h-[160px], overflow hidden
- Cada coluna: imagem importada, object-cover, hover scale 1.05
- Label no canto inferior esquerdo de cada foto em Bebas Neue branco com sombra de texto
- Fotos usadas como estao (ja editadas em P&B com grain)

**Cards de Metricas** (grid 5 colunas desktop, 2 mobile):
- Fundo branco, border-top 3px colorida (cada card cor diferente: verde escuro, rosa, verde medio, verde, vermelho)
- Icone em circulo com bg suave
- Valor em Bebas Neue 34px
- Label em Space Mono uppercase tiny tracking wide

**Card de Previsao**:
- Fundo verde escuro `#2d4a2e`, texto branco
- Grid 3 colunas com valores em Bebas Neue grande
- Badge rosa com pecas disponiveis

**Layout 2 colunas** (conteudo principal + lateral):

Coluna principal:
- Tabela de repasses com cabecalho verde escuro/texto branco uppercase
- Linhas com hover sutil, avatar colorido com inicial
- Barra de progresso slim
- Badges: verde (Pago), amarelo (Pendente), rosa (Parcial)
- Tabela de previsao por fornecedora (mesmo estilo)

Coluna lateral:
- **Card rosa** `#e8527a`: headline em Bebas Neue + DM Serif italic, texto branco, botao branco com texto rosa
- **Foto lookbook** (flatlay_edit): overlay gradiente escuro, label "FLAT LAY" em Bebas Neue + subtitulo "NOVIDADES DO DROP"

**Marca dagua**: logo colorida 80px, rotate +8deg, opacity 15%, position fixed bottom-right

#### 6. `src/pages/Login.tsx` -- Pagina nova
- Rota `/login` no App.tsx (fora do Layout)
- Split 50/50:
  - **Lado esquerdo**: fundo `#2d4a2e`, grid 2x3 com as 6 fotos em opacity 35%, logo branca (filter: brightness(0) invert(1)) 200px rotate-[-4deg] centralizada, headline "BRECHO / Peaoge" em Bebas Neue branco + DM Serif rosa, sticker "Moda Circular ✦" rotacionado em rosa
  - **Lado direito**: fundo creme, cards de socias (avatar colorido + nome), campo senha, botao verde escuro
- Ao logar: salvar nome/cor no localStorage, redirecionar para /

#### 7. `src/pages/Catalogo.tsx` -- Ajustes de estilo
- Filter bar: fundo branco, border-radius 16px, bordas sutis
- Tabela: cabecalho verde escuro com texto branco em Space Mono uppercase
- Badges de status em pill com cores saturadas
- Precos em Bebas Neue ou bold com cor verde escuro
- Manter toda logica funcional intacta

#### 8. `src/pages/Vendas.tsx` -- Mesmos ajustes de tabela
- Cabecalho verde escuro, badges coloridos, hover sutil
- Manter logica intacta

#### 9. `src/pages/Fornecedoras.tsx` -- Cards com nova estetica
- Avatar com fundo forte (40% opacity)
- Badge socia em rosa com estrela
- Border-radius 16px, bordas sutis em vez de sombras
- Progress bar slim com cor verde medio `#4a7a4b`

#### 10. `src/pages/Configuracoes.tsx` -- Ajustes visuais
- Card headers com fundo verde escuro e texto branco
- Botao salvar em rosa `#e8527a`
- Border-radius 16px

#### 11. `src/App.tsx` -- Rota de login
- Adicionar rota `/login` renderizando Login fora do Layout
- Manter todas as outras rotas dentro do Layout

---

### Detalhes tecnicos

**Fontes carregadas via Google Fonts** no index.css:
```
Bebas Neue (400)
DM Serif Display (400, 400italic)
Space Mono (400, 700)
```

**Assets copiados**: 7 imagens para src/assets, importadas como ES6 modules nos componentes.

**Logo comportamento**:
- Navbar: cores originais, h-[52px], rotate-[-3deg], sem filtro
- Login esquerdo: filter brightness(0) invert(1), w-[200px], rotate-[-4deg]
- Marca dagua dashboard: cores originais, w-[80px], rotate-[8deg], opacity 15%

**Grain overlay**: pseudo-elemento `::after` no body com background SVG noise inline, fixed, full-screen, pointer-events none.

**Nenhuma lib nova**. Tudo com Tailwind + CSS custom.

