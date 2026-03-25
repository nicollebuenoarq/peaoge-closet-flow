

## Plano: Login Funcional + Saudação Personalizada + Cleanup Navbar

### 1. Login com as 3 sócias (`src/pages/Login.tsx`)

- Três avatares clicáveis: **Nicolle**, **Larissa**, **Joice**
- Cada uma com senha própria (hardcoded — controle interno)
- Ao logar, salvar o nome no `localStorage` como `brecho_user_name`
- Toast de erro se senha incorreta
- Cores: Nicolle (#e8527a), Larissa (#4a7a4b), Joice (#2d4a2e)

### 2. Saudação personalizada (`src/pages/Dashboard.tsx`)

- Já lê `localStorage.getItem('brecho_user_name')` — basta garantir que o login salva o nome correto
- Greeting muda de "Olá, Peaogê" para "Olá, Nicolle 👋", "Olá, Larissa 👋", etc.

### 3. Remover user chip duplicado (`src/components/Layout.tsx`)

- Remover o bloco com bolinha rosa + nome (linhas 66-74)
- Adicionar botão de logout discreto no lugar (ícone LogOut)

### 4. Auth guard (`src/App.tsx`)

- Se `brecho_user_name` não existe no localStorage, redirecionar para `/login`

### Arquivos

| Arquivo | Mudança |
|---|---|
| `src/pages/Login.tsx` | 3 sócias com senha, salvar nome no localStorage |
| `src/pages/Dashboard.tsx` | Saudação já funciona (nenhuma mudança necessária) |
| `src/components/Layout.tsx` | Remover user chip, adicionar logout |
| `src/App.tsx` | Auth guard simples |

