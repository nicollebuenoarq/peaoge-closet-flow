

## Revisão: Ajustes para uso real do Planejamento

### Problemas encontrados

**1. Senhas hardcoded no código (Login.tsx)**
As senhas estão escritas diretamente no código (`nicolle123`, `larissa123`, `joice123`). Qualquer pessoa que inspecionar o site consegue ver. Para uso real, isso precisa ser movido para algo mais seguro — ou pelo menos permitir que vocês troquem as senhas nas Configurações.

**2. Dados apenas no localStorage**
Tudo (lembretes, drops, peças, vendas) fica salvo apenas no navegador de quem está usando. Se a Nicolle criar um lembrete no celular dela, a Larissa não vai ver no celular dela. Cada aparelho tem seus próprios dados isolados. Para funcionar entre as 3 sócias, precisaria de um banco de dados online (Supabase).

**3. Lembrete sem ordenação por urgência**
Os lembretes pendentes aparecem na ordem em que foram criados. Os mais urgentes (com data limite próxima ou atrasados) deveriam aparecer primeiro.

**4. Data limite com bug de fuso horário**
Ao criar um lembrete com data limite, o cálculo de "Atrasado!" pode marcar errado por causa do fuso (compara `new Date(dataLimite)` que assume meia-noite UTC com `new Date()` local).

**5. Não dá pra voltar ao Dashboard facilmente no mobile**
No Dashboard não aparece o menu de navegação (é by design), mas no celular não tem botão óbvio pra voltar.

---

### O que sugiro fazer agora (sem banco de dados)

| # | Ajuste | Arquivo |
|---|---|---|
| 1 | Ordenar lembretes: atrasados primeiro, depois por data limite mais próxima | `Planejamento.tsx` |
| 2 | Corrigir fuso horário na comparação de datas | `Planejamento.tsx` |
| 3 | Permitir trocar senha nas Configurações (salvar hash no localStorage) | `Configuracoes.tsx`, `Login.tsx` |

### O que precisaria para funcionar entre as 3 sócias

Para que um lembrete criado pela Nicolle apareça para a Larissa, vocês precisam de um **banco de dados compartilhado** (Supabase). Isso envolveria:
- Criar tabelas online para lembretes, drops, peças, vendas, fornecedoras
- Migrar os dados do localStorage para o banco
- Login real com autenticação

Isso é uma mudança maior. Posso fazer em etapas se quiserem.

### Recomendação
Começar pelos ajustes rápidos (ordenação + datas) e depois decidir se querem migrar para banco de dados compartilhado.

