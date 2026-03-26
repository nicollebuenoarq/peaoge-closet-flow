-- ================================================================
-- 001_schema.sql  --  Peaoge Closet Flow
-- Execute este arquivo no SQL Editor do Supabase (uma vez)
-- ================================================================

-- ----------------------------------------------------------------
-- 0.  Extensoes (ja vem ativas no Supabase, mas por garantia)
-- ----------------------------------------------------------------
create extension if not exists "uuid-ossp";


-- ================================================================
-- 1.  PROFILES
--     Criado automaticamente ao fazer signup;
--     use um trigger ou crie manualmente apos criar usuarios.
-- ================================================================
create table if not exists public.profiles (
  id   uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  cargo text not null default 'Socia',
  cor  text not null default '#e8527a',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_all_auth" on public.profiles;
create policy "profiles_all_auth" on public.profiles
  for all to authenticated
  using (true) with check (true);


-- ================================================================
-- 2.  FORNECEDORAS
-- ================================================================
create table if not exists public.fornecedoras (
  id           text primary key,
  nome         text not null,
  contato      text not null default '',
  chave_pix    text not null default '',
  observacoes  text not null default '',
  ativa        boolean not null default true,
  eh_socia     boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.fornecedoras enable row level security;

drop policy if exists "fornecedoras_all_auth" on public.fornecedoras;
create policy "fornecedoras_all_auth" on public.fornecedoras
  for all to authenticated
  using (true) with check (true);


-- ================================================================
-- 3.  PECAS
-- ================================================================
create table if not exists public.pecas (
  sku            integer primary key,
  descricao      text not null,
  categoria      text not null default '',
  tamanho        text not null default '',
  fornecedora_id text references public.fornecedoras(id),
  data_entrada   text not null default '',
  status         text not null default 'Disponivel',
  preco          numeric(10,2) not null default 0,
  drop           integer not null default 0,
  foto           text,
  created_at     timestamptz not null default now()
);

alter table public.pecas enable row level security;

drop policy if exists "pecas_all_auth" on public.pecas;
create policy "pecas_all_auth" on public.pecas
  for all to authenticated
  using (true) with check (true);


-- ================================================================
-- 4.  VENDAS
-- ================================================================
create table if not exists public.vendas (
  id                   text primary key,
  data_venda           text not null,
  sku_peca             integer references public.pecas(sku),
  descricao_peca       text not null default '',
  fornecedora_id       text references public.fornecedoras(id),
  drop                 integer not null default 0,
  desconto             numeric(10,2) not null default 0,
  preco_final          numeric(10,2) not null default 0,
  pagamento            text not null default 'Pix',
  comissao_fornecedora numeric(10,2) not null default 0,
  parcela_brecho       numeric(10,2) not null default 0,
  pago_fornecedora     boolean not null default false,
  data_pagamento       text,
  compradora           text not null default '',
  endereco_entrega     text not null default '',
  data_entrega         text,
  created_at           timestamptz not null default now()
);

alter table public.vendas enable row level security;

drop policy if exists "vendas_all_auth" on public.vendas;
create policy "vendas_all_auth" on public.vendas
  for all to authenticated
  using (true) with check (true);


-- ================================================================
-- 5.  LEMBRETES
-- ================================================================
create table if not exists public.lembretes (
  id          text primary key,
  titulo      text not null,
  descricao   text not null default '',
  data_limite text,
  responsavel text[] not null default '{}',
  concluido   boolean not null default false,
  criado_em   text not null,
  created_at  timestamptz not null default now()
);

alter table public.lembretes enable row level security;

drop policy if exists "lembretes_all_auth" on public.lembretes;
create policy "lembretes_all_auth" on public.lembretes
  for all to authenticated
  using (true) with check (true);


-- ================================================================
-- 6.  DROP_PLANS
-- ================================================================
create table if not exists public.drop_plans (
  drop           integer primary key,
  data_prevista  text not null default '',
  preco_maximo   numeric(10,2) not null default 0,
  meta_pecas     integer not null default 0,
  observacoes    text not null default '',
  created_at     timestamptz not null default now()
);

alter table public.drop_plans enable row level security;

drop policy if exists "drop_plans_all_auth" on public.drop_plans;
create policy "drop_plans_all_auth" on public.drop_plans
  for all to authenticated
  using (true) with check (true);


-- ================================================================
-- 7.  CONFIG  (linha unica  --  id sempre = 1)
-- ================================================================
create table if not exists public.config (
  id                    integer primary key default 1,
  percentual_fornecedora numeric(5,4) not null default 0.60,
  percentual_brecho      numeric(5,4) not null default 0.40,
  taxa_cartao            numeric(5,4) not null default 0.05,
  drop_atual             integer not null default 2,
  status_validos         text[]  not null default array['Disponivel','Vendido','Devolvido','Reservado'],
  meios_pagamento        text[]  not null default array['Dinheiro','Pix','Cartao Credito','Cartao Debito','Transferencia'],
  next_sku               integer not null default 1,
  updated_at             timestamptz not null default now(),
  constraint config_single_row check (id = 1)
);

alter table public.config enable row level security;

drop policy if exists "config_all_auth" on public.config;
create policy "config_all_auth" on public.config
  for all to authenticated
  using (true) with check (true);


-- ================================================================
-- 8.  Linha inicial da config (opcional; o seed do app faz isso)
--     Descomente se quiser garantir via SQL
-- ================================================================
-- insert into public.config (id) values (1)
-- on conflict (id) do nothing;


-- ================================================================
-- 9.  Usuarios de autenticacao
--     Crie manualmente no Supabase Dashboard em:
--     Authentication > Users > Add user
--
--     nicolle@peaoge.com   (senha a definir)
--     larissa@peaoge.com   (senha a definir)
--     joice@peaoge.com     (senha a definir)
-- ================================================================
