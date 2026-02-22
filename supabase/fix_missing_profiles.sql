-- 1. Cria perfis para usuários existentes que ainda não têm
insert into public.profiles (id, email)
select id, email
from auth.users
where id not in (select id from public.profiles);

-- 2. Atualiza a função de incremento para ser mais inteligente
-- Se o perfil não existir, ela cria um automaticamente com contagem 1
create or replace function increment_usage(user_id uuid)
returns void as $$
begin
  -- Tenta atualizar o contador
  update public.profiles
  set usage_count = coalesce(usage_count, 0) + 1
  where id = user_id;

  -- Se nenhuma linha foi atualizada (perfil não existia), cria o perfil
  if not found then
    insert into public.profiles (id, usage_count)
    values (user_id, 1);
  end if;
end;
$$ language plpgsql security definer;
