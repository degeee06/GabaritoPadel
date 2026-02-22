-- 1. Adiciona coluna para rastrear a data do último uso
alter table public.profiles 
add column if not exists last_usage_date date default current_date;

-- 2. Atualiza a função de incremento com lógica de reset diário (Fuso Brasília)
create or replace function increment_usage(user_id uuid)
returns void as $$
declare
  today date;
  user_last_date date;
begin
  -- Pega a data atual no fuso de Brasília
  today := (now() at time zone 'America/Sao_Paulo')::date;
  
  -- Busca a data do último uso do usuário
  select last_usage_date into user_last_date
  from public.profiles
  where id = user_id;

  -- Se não existir perfil, cria um novo já com a data de hoje
  if not found then
    insert into public.profiles (id, usage_count, last_usage_date)
    values (user_id, 1, today);
    return;
  end if;

  -- Lógica de atualização
  if user_last_date < today then
    -- Se mudou o dia: Reseta contador para 1 e atualiza a data
    update public.profiles
    set usage_count = 1,
        last_usage_date = today
    where id = user_id;
  else
    -- Se é o mesmo dia: Apenas incrementa
    update public.profiles
    set usage_count = usage_count + 1
    where id = user_id;
  end if;
end;
$$ language plpgsql security definer;
