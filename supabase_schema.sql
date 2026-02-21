-- Tabela para armazenar o histórico de partidas
create table matches (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  my_team_description text not null,
  opponents_description text not null,
  image_url text, -- URL da imagem se houver upload (opcional)
  tactical_plan jsonb not null, -- Armazena o JSON completo da estratégia gerada
  result text, -- Pode ser 'Vitória', 'Derrota', etc. (opcional, para atualizar depois)
  score text -- Placar do jogo (opcional, para atualizar depois)
);

-- Políticas de segurança (RLS) para permitir acesso público (para demo/MVP)
-- Em produção real com autenticação, você mudaria isso para 'auth.uid() = user_id'
alter table matches enable row level security;

create policy "Enable read access for all users"
on matches for select
using (true);

create policy "Enable insert access for all users"
on matches for insert
with check (true);

create policy "Enable update access for all users"
on matches for update
using (true);
