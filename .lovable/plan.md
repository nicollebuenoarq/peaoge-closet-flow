## O que está acontecendo

O site está abrindo (verifiquei o publicado). O que falha é o `signInWithPassword` no Lovable Cloud: hoje qualquer erro vira o toast genérico **"Senha incorreta"** — então não dá pra saber se foi senha errada, email não confirmado, conta bloqueada ou falha de rede. Além disso, não existe nenhum botão "Esqueci minha senha", então qualquer senha esquecida vira beco sem saída.

## Ações

### 1. Reset imediato das senhas (Nicolle, Larissa, Joice → `peaoge123`)

Migration que atualiza a senha das 3 contas em `auth.users` usando `crypt()` com salt bcrypt:

```sql
UPDATE auth.users
SET encrypted_password = crypt('peaoge123', gen_salt('bf')),
    updated_at = now()
WHERE email IN ('nicolle@peaoge.com','larissa@peaoge.com','joice@peaoge.com');
```

Após rodar, cada sócia entra com `peaoge123` e pode trocar em **Configurações → Senhas de Acesso**.

### 2. Mensagens de erro reais no login (`src/pages/Login.tsx`)

Substituir o toast genérico por mensagens específicas:

- `invalid_credentials` / `Invalid login credentials` → "Senha incorreta. Tente novamente."
- `email_not_confirmed` → "Email ainda não confirmado."
- `over_request_rate_limit` / `429` → "Muitas tentativas. Aguarde 1 minuto."
- Erro de rede / `Failed to fetch` → "Sem conexão. Verifique sua internet."
- Qualquer outro → mostrar `error.message` real, não esconder.

### 3. Fluxo "Esqueci minha senha"

**a) Link "Esqueci minha senha" no `Login.tsx`**: abaixo do campo de senha, quando uma sócia está selecionada. Ao clicar, dispara:

```ts
supabase.auth.resetPasswordForEmail(socia.email, {
  redirectTo: `${window.location.origin}/reset-password`
})
```

E mostra toast: "Email enviado para `email@peaoge.com`. Veja sua caixa de entrada."

**b) Nova rota pública `/reset-password`** (`src/pages/ResetPassword.tsx`): página simples no mesmo layout do login. Ao chegar com `type=recovery` no hash da URL, mostra dois campos (nova senha + confirmação) e chama `supabase.auth.updateUser({ password })`. Em sucesso, redireciona para `/login`.

**c) Registrar a rota em `src/App.tsx`** fora do `AuthGuard`, junto com `/login`.

Os emails de reset usam o template padrão do Lovable Cloud (já funciona out-of-the-box, sem precisar configurar domínio próprio).

## Arquivos alterados

- **nova migration** — reset das 3 senhas
- `src/pages/Login.tsx` — mensagens de erro + link "Esqueci minha senha"
- `src/pages/ResetPassword.tsx` — **novo** arquivo
- `src/App.tsx` — adicionar rota `/reset-password`

## O que NÃO muda

- Nenhuma lógica de catálogo, vendas, dashboard, fornecedoras, planejamento, configurações
- Estrutura das tabelas e RLS do banco
- Layout desktop nem mobile das outras páginas
- Sistema de "Configurações → Senhas de Acesso" continua funcionando para troca interna
