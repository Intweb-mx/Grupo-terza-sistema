create table public.proyectos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  activo boolean default true,
  created_at timestamptz default now()
);

create table public.socios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  porcentaje_participacion numeric(5,2) not null,
  usuario_id uuid references public.usuarios(id),
  created_at timestamptz default now()
);

create table public.movimientos_contables (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid references public.proyectos(id),
  tipo text not null check (tipo in ('ingreso','egreso')),
  categoria text not null,
  descripcion text,
  monto integer not null,             -- centavos
  fecha date not null,
  referencia text,
  cfdi_uuid text,                     -- UUID del timbrado SAT — inmutable
  cfdi_estado text check (cfdi_estado in ('vigente','cancelado')),
  cfdi_motivo_cancelacion text check (cfdi_motivo_cancelacion in ('01','02','03','04')),
  created_at timestamptz default now()
);

-- Blindaje a nivel DB de la regla "UUID del timbrado es inmutable": una vez
-- puesto, ningún UPDATE puede cambiarlo (ni siquiera un bug en el código de
-- aplicación podría saltarse esto).
create or replace function public.proteger_cfdi_uuid()
returns trigger language plpgsql as $$
begin
  if old.cfdi_uuid is not null and new.cfdi_uuid is distinct from old.cfdi_uuid then
    raise exception 'cfdi_uuid es inmutable una vez timbrado';
  end if;
  return new;
end;
$$;

create trigger proteger_cfdi_uuid_movimientos
  before update on public.movimientos_contables
  for each row execute function public.proteger_cfdi_uuid();

-- RLS: contabilidad es visible para roles internos + socios (ven utilidades
-- de su interés), pero solo dueño/administrador/contador escriben. asesor
-- no tiene acceso — no es parte de su trabajo.
alter table public.proyectos enable row level security;

create policy "Ver proyectos" on public.proyectos
  for select using (
    public.usuario_rol_actual() in ('dueno','administrador','contador','socio')
  );

create policy "Gestionar proyectos" on public.proyectos
  for all using (
    public.usuario_rol_actual() in ('dueno','administrador','contador')
  );

alter table public.socios enable row level security;

create policy "Ver socios" on public.socios
  for select using (
    public.usuario_rol_actual() in ('dueno','administrador','contador','socio')
  );

-- Registro de socios (quién es socio y qué % tiene) es más sensible que los
-- movimientos del día a día — solo dueño/administrador lo tocan.
create policy "Gestionar socios" on public.socios
  for all using (
    public.usuario_rol_actual() in ('dueno','administrador')
  );

alter table public.movimientos_contables enable row level security;

create policy "Ver movimientos" on public.movimientos_contables
  for select using (
    public.usuario_rol_actual() in ('dueno','administrador','contador','socio')
  );

create policy "Gestionar movimientos" on public.movimientos_contables
  for all using (
    public.usuario_rol_actual() in ('dueno','administrador','contador')
  );

create trigger audit_movimientos_contables
  after insert or update or delete on public.movimientos_contables
  for each row execute function public.registrar_auditoria();
