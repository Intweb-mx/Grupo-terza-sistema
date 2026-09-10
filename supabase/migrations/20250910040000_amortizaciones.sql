create table public.amortizaciones (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id),
  numero_pago integer not null,
  fecha_corte date not null,           -- día 1 o 16 del mes
  capital integer not null,            -- centavos
  interes integer not null default 0,  -- centavos
  penalizacion integer not null default 0, -- centavos
  total integer not null,              -- centavos
  estado text default 'pendiente' check (estado in ('pendiente','pagado','vencido','reestructurado')),
  fecha_pago_real date,
  created_at timestamptz default now()
);

alter table public.amortizaciones enable row level security;

-- Lectura: cualquier autenticado (se muestra en la ficha del cliente)
create policy "Ver amortizaciones" on public.amortizaciones
  for select using (auth.uid() is not null);

-- Escritura: los mismos roles que gestionan contratos, porque el calendario
-- se genera junto con el contrato en la misma operación del asesor.
create policy "Gestionar amortizaciones" on public.amortizaciones
  for all using (
    public.usuario_rol_actual() in ('dueno','administrador','asesor')
  );

create trigger audit_amortizaciones
  after insert or update or delete on public.amortizaciones
  for each row execute function public.registrar_auditoria();
