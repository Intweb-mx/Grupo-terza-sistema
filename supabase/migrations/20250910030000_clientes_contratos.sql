create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellidos text not null,
  email text,
  telefono text,
  rfc text,
  direccion text,
  ciudad text,
  created_at timestamptz default now()
);

create table public.contratos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('compraventa','arrendamiento','renta_temporal')),
  cliente_id uuid not null references public.clientes(id),
  propiedad_id uuid not null references public.propiedades(id),
  fecha_inicio date not null,
  fecha_fin date,
  monto_total integer not null,        -- centavos
  enganche integer default 0,          -- centavos
  plazo_meses integer,
  estado text default 'activo' check (estado in ('borrador','activo','vencido','cancelado','liquidado')),
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Al activar contrato, marcar propiedad como vendida/rentada.
-- security definer: el asesor que crea el contrato no tiene permiso de
-- escritura directa sobre propiedades (solo dueño/administrador), así que
-- sin esto el UPDATE de abajo lo filtraría la RLS y no pasaría nada.
create or replace function public.actualizar_disponibilidad_propiedad()
returns trigger language plpgsql security definer as $$
begin
  if new.estado = 'activo' then
    update public.propiedades set
      estado_disponibilidad = case new.tipo
        when 'compraventa' then 'vendido'
        else 'rentado'
      end
    where id = new.propiedad_id;
  end if;
  return new;
end;
$$;

create trigger trigger_disponibilidad
  after insert or update on public.contratos
  for each row execute function public.actualizar_disponibilidad_propiedad();

-- RLS: lectura para cualquier autenticado, escritura para roles de cara
-- al cliente (dueño, administrador, asesor — el asesor cierra sus propios
-- tratos). socio y contador quedan de solo lectura.
alter table public.clientes enable row level security;

create policy "Ver clientes" on public.clientes
  for select using (auth.uid() is not null);

create policy "Gestionar clientes" on public.clientes
  for all using (
    public.usuario_rol_actual() in ('dueno','administrador','asesor')
  );

alter table public.contratos enable row level security;

create policy "Ver contratos" on public.contratos
  for select using (auth.uid() is not null);

create policy "Gestionar contratos" on public.contratos
  for all using (
    public.usuario_rol_actual() in ('dueno','administrador','asesor')
  );

-- Auditoría (reutiliza la función de la migración de propiedades)
create trigger audit_clientes
  after insert or update or delete on public.clientes
  for each row execute function public.registrar_auditoria();

create trigger audit_contratos
  after insert or update or delete on public.contratos
  for each row execute function public.registrar_auditoria();
