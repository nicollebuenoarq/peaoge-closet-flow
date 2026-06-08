## Login em 1 clique (sem senha visível)

A tela vai mostrar só os 3 cards (Nicolle, Larissa, Joice). Clicou no perfil → entrou. Por baixo, o app faz `signInWithPassword` com uma senha compartilhada embutida no código (`peaoge123`). Banco continua protegido por RLS — nada quebra.

### Mudanças no código

**1. `src/pages/Login.tsx`** — simplificar:
- Remover input de senha, botão "ENTRAR", link "Esqueci minha senha", estado `senha`/`selected`/`resetLoading`.
- Cada card de sócia vira um botão grande que, no clique, já chama `signInWithPassword({ email: socia.email, password: 'peaoge123' })` e navega pra `/`.
- Adicionar estado `loadingFor` (qual card está carregando) pra mostrar spinner sutil só naquele card.
- Mensagens de erro reais permanecem (rede, rate-limit, etc.).

**2. `src/pages/Configuracoes.tsx`** — remover a seção "SENHAS DE ACESSO" inteira (o card com `<SenhaField>` e o componente `SenhaField`). Imports de `Lock`, `supabase` ficam apenas se ainda forem usados (são).

**3. `src/App.tsx`** — remover a rota `/reset-password` e o import.

**4. `src/pages/ResetPassword.tsx`** — deletar o arquivo.

### Passo manual seu (1 minuto, uma vez)

Pra cada sócia, no painel **Lovable Cloud → Users**:
- Abrir `nicolle@peaoge.com`, `larissa@peaoge.com`, `joice@peaoge.com`
- "Set password" → `peaoge123`

A partir daí: 1 clique no perfil = dentro. Sem digitar nada.

### O que NÃO muda

- Estrutura do banco, RLS, dados das peças/vendas/fornecedoras
- Layout do resto do app (catálogo, vendas, dashboard, etc.)
- Detecção de quem está logado em `Layout.tsx`, `Dashboard.tsx`, `LembretesPopup.tsx` (continuam lendo `supabase.auth.getUser()`)

### Trade-off (pra ficar claro)

A senha `peaoge123` fica visível no código-fonte do frontend. Qualquer pessoa que abrir o "inspecionar elemento" no navegador pode ver. Como você disse que ninguém externo tem acesso ao site, está ok — mas vale registrar.
