create table public.prospectos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text,
  interes text,
  fuente text check (fuente in ('referido','facebook','instagram','tiktok','portal','directo','otro')),
  etapa text default 'nuevo'
    check (etapa in ('nuevo','contactado','interesado','negociacion','cerrado','perdido')),
  asesor_id uuid references public.usuarios(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.interacciones (
  id uuid primary key default gen_random_uuid(),
  prospecto_id uuid not null references public.prospectos(id),
  tipo text not null check (tipo in ('llamada','visita','whatsapp','email','reunion')),
  notas text,
  realizado_por uuid references public.usuarios(id),
  created_at timestamptz default now()
);

alter table public.prospectos enable row level security;

-- Asesor ve y gestiona solo sus propios prospectos. Dueño/administrador ven
-- y gestionan todos (para reasignar leads, dar seguimiento del equipo).
create policy "Ver prospectos" on public.prospectos
  for select using (
    asesor_id = auth.uid() or public.usuario_rol_actual() in ('dueno','administrador')
  );

create policy "Gestionar prospectos" on public.prospectos
  for all using (
    asesor_id = auth.uid() or public.usuario_rol_actual() in ('dueno','administrador')
  )
  with check (
    asesor_id = auth.uid() or public.usuario_rol_actual() in ('dueno','administrador')
  );

alter table public.interacciones enable row level security;

-- El acceso a una interacción sigue al acceso de su prospecto.
create policy "Ver interacciones" on public.interacciones
  for select using (
    exists (
      select 1 from public.prospectos p
      where p.id = prospecto_id
      and (p.asesor_id = auth.uid() or public.usuario_rol_actual() in ('dueno','administrador'))
    )
  );

create policy "Crear interacciones" on public.interacciones
  for insert with check (
    exists (
      select 1 from public.prospectos p
      where p.id = prospecto_id
      and (p.asesor_id = auth.uid() or public.usuario_rol_actual() in ('dueno','administrador'))
    )
  );
