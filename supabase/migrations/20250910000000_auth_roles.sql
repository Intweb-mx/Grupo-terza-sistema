-- Trigger: crea fila en public.usuarios al registrarse en auth.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.usuarios (id, nombre, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'rol', 'asesor')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS en usuarios
alter table public.usuarios enable row level security;

-- Usuario ve su propio perfil
create policy "Ver propio perfil" on public.usuarios
  for select using (auth.uid() = id);

-- Función security definer: evita recursión infinita en la policy de abajo,
-- que de otro modo consultaría usuarios dentro de una policy sobre usuarios.
create or replace function public.usuario_rol_actual()
returns text
language sql security definer
set search_path = public
stable
as $$
  select rol from public.usuarios where id = auth.uid();
$$;

-- Dueño y administrador ven todos
create policy "Admin ve todos" on public.usuarios
  for select using (
    public.usuario_rol_actual() in ('dueno','administrador')
  );
