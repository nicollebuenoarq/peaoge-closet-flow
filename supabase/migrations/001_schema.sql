-- ============================================================
-- 001_schema.sql — Peaogê Closet Flow
-- ============================================================

-- PROFILES (espelha auth.users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    nome text not null,
    cargo text default 'Sócia',
    cor text default '#e8527a',
    created_at timestamptz default now()
  );

alter table public.profiles enable row level security;
create policy "profiles: auth all" on public.profiles
  for all to authenticated using (true) with check (true);

-- FORNECEDORAS
create table if not exists public.fornecedoras (
    id text primary key,
    nome text not null,
    contato text default '',
    chave_pix text default '',
    observacoes text default '',
    ativa boolean default true,
    eh_socia boolean default false,
    created_at timestamptz default now()
  );

alter table public.fornecedoras enable row level security;
create policy "fornecedoras: auth all" on public.fornecedoras
  for all to authenticated using (true) with check (true);

-- PECAS
create table if not exists public.pecas (
    sku integer primary key,
    descricao text not null,
    categoria text default '',
    tamanho text default '',
    fornecedora_id text references public.fornecedoras(id),
    data_entrada text default '',
    status text default 'Disponível',
    preco numeric(10,2) default 0,
    drop integer default 0,
    foto text,
    created_at timestamptz default now()
  );

alter table public.pecas enable row level security;
create policy "pecas: auth all" on public.pecas
  for all to authenticated using (true) with check (true);

-- VENDAS
create table if not exists public.vendas (
    id text primary key,
    data_venda text not null,
    sku_peca integer references public.pecas(sku),
    descricao_peca text default '',
    fornecedora_id text references public.fornecedoras(id),
    drop integer default 0,
    desconto numeric(10,2) default 0,
    preco_final numeric(10,2) default 0,
    pagamento text default 'Pix',
    comissao_fornecedora numeric(10,2) default 0,
    parcela_brecho numeric(10,2) default 0,
    pago_fornecedora boolean default false,
    data_pagamento text,
    compradora text default '',
    endereco_entrega text default '',
    data_entrega text,
    created_at timestamptz default now()
  );

alter table public.vendas enable row level security;
create policy "vendas: auth all" on public.vendas
  for all to authenticated using (true) with check (true);

-- LEMBRETES
create table if not exists public.lembretes (
    id text primary key,
    titulo text not null,
    descricao text default '',
    data_limite text,
    responsavel text[] default '{}',
    concluido boolean default false,
    criado_em text not null,
    created_at timestamptz default now()
  );

alter table public.lembretes enable row level security;
create policy "lembretes: auth all" on public.lembretes
  for all to authenticated using (true) with check (true);

-- DROP_PLANS
create table if not exists public.drop_plans (
    drop integer primary key,
    data_prevista text default '',
    preco_maximo numeric(10,2) default 0,
    meta_pecas integer default 0,
    observacoes text default '',
    created_at timestamptz default now()
  );

alter table public.drop_plans enable row level security;
create policy "drop_plans: auth all" on public.drop_plans
  for all to authenticated using (true) with check (true);

-- CONFIG (linha única, id fixo)
create table if not exists public.config (
    id integer primary key default 1,
    percentual_fornecedora numeric(5,4) default 0.60,
    percentual_brecho numeric(5,4) default 0.40,
    taxa_cartao numeric(5,4) default 0.05,
    drop_atual integer default 2,
    status_validos text[] default array['Disponível','Vendido','Devolvido','Reservado'],
    meios_pagamento text[] default array['Dinheiro','Pix','Cartão Crédito','Cartão Débito','Transferência'],
    next_sku integer default 1,
    updated_at timestamptz default now(),
    constraint config_single_row check (id = 1)
  );

alter table public.config enable row level security;
create policy "config: auth all" on public.config
  for all to authenticated using (true) with check (true);
