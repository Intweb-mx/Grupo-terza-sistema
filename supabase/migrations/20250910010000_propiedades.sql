create table public.propiedades (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo text not null check (tipo in ('casa','departamento','local','oficina','terreno')),
  precio integer not null,         -- centavos MXN
  superficie_m2 numeric(10,2),
  direccion text,
  ciudad text not null,
  descripcion text,
  estado_disponibilidad text default 'disponible'
    check (estado_disponibilidad in ('disponible','reservado','vendido','rentado')),
  imagen_url text,
  galeria text[] default '{}',
  lote_id text,                    -- referencia al mapa visual
  proyecto_id uuid,                -- para contabilidad separada
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.propiedades enable row level security;

-- Lectura: todos los roles autenticados
create policy "Ver propiedades" on public.propiedades
  for select using (auth.uid() is not null);

-- Escritura: dueno y administrador
create policy "Editar propiedades" on public.propiedades
  for all using (
    public.usuario_rol_actual() in ('dueno','administrador')
  );

-- Función de auditoría reutilizable para otras tablas críticas
create or replace function public.registrar_auditoria()
returns trigger language plpgsql security definer as $$
begin
  insert into public.audit_log (usuario_id, tabla, registro_id, accion, valor_anterior, valor_nuevo)
  values (
    auth.uid(),
    TG_TABLE_NAME,
    coalesce(new.id, old.id),
    lower(TG_OP),
    case when TG_OP = 'INSERT' then null else to_jsonb(old) end,
    case when TG_OP = 'DELETE' then null else to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

create trigger audit_propiedades
  after insert or update or delete on public.propiedades
  for each row execute function public.registrar_auditoria();
