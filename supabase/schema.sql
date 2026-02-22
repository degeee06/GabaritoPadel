-- Habilita extensão UUID se não estiver habilitada
create extension if not exists "uuid-ossp";

-- 1. Tabela de Perfis (Vinculada ao Auth do Supabase)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  plan text default 'free', -- 'free' ou 'premium'
  usage_count int default 0,
  asaas_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Pagamentos (Histórico)
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  mp_payment_id text, -- ID do Pagamento no Asaas
  status text, -- 'pending', 'approved', etc.
  amount numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Trigger para criar perfil automaticamente ao cadastrar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Remove trigger se já existir para recriar
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Políticas de Segurança (RLS)
alter table public.profiles enable row level security;
alter table public.payments enable row level security;

-- Perfis: Usuário vê e edita apenas o seu
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Pagamentos: Usuário vê apenas os seus
create policy "Users can view own payments" on public.payments
  for select using (auth.uid() = user_id);

-- 5. Função para incrementar uso (chamada pelo front/back)
create or replace function increment_usage(user_id uuid)
returns void as $$
begin
  update public.profiles
  set usage_count = usage_count + 1
  where id = user_id;
end;
$$ language plpgsql security definer;
