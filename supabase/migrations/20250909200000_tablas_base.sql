-- usuarios (extiende auth.users de Supabase)
create table public.usuarios (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text not null,
  email text not null,
  rol text not null check (rol in ('dueno','socio','administrador','asesor','contador')),
  activo boolean default true,
  created_at timestamptz default now()
);

-- audit_log (nunca se borra, nunca se edita)
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id),
  tabla text not null,
  registro_id uuid not null,
  campo text,
  valor_anterior jsonb,
  valor_nuevo jsonb,
  accion text not null check (accion in ('insert','update','delete')),
  created_at timestamptz default now()
);

-- RLS: audit_log solo lectura para roles autorizados
alter table public.audit_log enable row level security;
create policy "Solo lectura" on public.audit_log
  for select using (
    exists (
      select 1 from public.usuarios
      where id = auth.uid()
      and rol in ('dueno','administrador','contador')
    )
  );
