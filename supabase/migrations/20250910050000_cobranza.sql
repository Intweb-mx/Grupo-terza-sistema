create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id),
  contrato_id uuid not null references public.contratos(id),
  amortizacion_id uuid references public.amortizaciones(id),
  monto integer not null,              -- centavos
  fecha date not null,
  referencia text,
  metodo_pago text check (metodo_pago in ('efectivo','transferencia','cheque','tarjeta')),
  registrado_por uuid references public.usuarios(id),
  created_at timestamptz default now()
);

create table public.penalizaciones (
  id uuid primary key default gen_random_uuid(),
  amortizacion_id uuid not null references public.amortizaciones(id),
  monto integer not null default 30000, -- $300 MXN en centavos
  fecha_aplicacion date not null,
  created_at timestamptz default now()
);

-- Una sola penalización por cuota — la regla de negocio es "una sola vez
-- por período quincenal, no acumula por día".
create unique index penalizaciones_amortizacion_unica on public.penalizaciones (amortizacion_id);

alter table public.pagos enable row level security;

create policy "Ver pagos" on public.pagos
  for select using (auth.uid() is not null);

create policy "Gestionar pagos" on public.pagos
  for all using (
    public.usuario_rol_actual() in ('dueno','administrador','asesor','contador')
  );

alter table public.penalizaciones enable row level security;

create policy "Ver penalizaciones" on public.penalizaciones
  for select using (auth.uid() is not null);

create policy "Gestionar penalizaciones" on public.penalizaciones
  for all using (
    public.usuario_rol_actual() in ('dueno','administrador')
  );

create trigger audit_pagos
  after insert or update or delete on public.pagos
  for each row execute function public.registrar_auditoria();

create trigger audit_penalizaciones
  after insert or update or delete on public.penalizaciones
  for each row execute function public.registrar_auditoria();
