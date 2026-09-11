-- Postgres NO indexa llaves foráneas automáticamente (solo primary keys y
-- unique). Hasta ahora, cada query del sistema que filtra por contrato_id,
-- cliente_id, fecha_corte, estado, etc. hacía sequential scan. Con pocos
-- datos de prueba no se nota — en cuanto crezca la cartera real, cada
-- navegación entre páginas se vuelve progresivamente más lenta. Los
-- índices de abajo cubren los patrones de filtro que ya existen en
-- lib/server/*.ts (no son especulativos, cada uno corresponde a un query
-- real del código).

-- "contrato de compraventa más reciente del cliente": patrón repetido en
-- cobranza, clientes, portal — cliente_id como columna líder también sirve
-- para queries que solo filtran por cliente_id.
create index contratos_cliente_tipo_idx on public.contratos (cliente_id, tipo);

-- "cuotas pendientes/vencidas de este contrato": registrarPago, obtenerSaldo,
-- reestructurarContrato. contrato_id como líder también sirve para
-- obtenerAmortizacion (que no filtra por estado).
create index amortizaciones_contrato_estado_idx on public.amortizaciones (contrato_id, estado);

-- cron de penalizaciones (fecha_corte exacta) y reportes de cartera
-- vencida/flujo proyectado (rango de fecha_corte + estado).
create index amortizaciones_fecha_estado_idx on public.amortizaciones (fecha_corte, estado);

create index pagos_cliente_id_idx on public.pagos (cliente_id);
create index pagos_contrato_id_idx on public.pagos (contrato_id);

-- filtro de GET /api/prospectos y la policy RLS (asesor_id = auth.uid()).
create index prospectos_asesor_id_idx on public.prospectos (asesor_id);
create index prospectos_etapa_idx on public.prospectos (etapa);

-- listarInteracciones, "última interacción" en listarProspectos, y la
-- policy RLS de interacciones (todas resuelven por prospecto_id).
create index interacciones_prospecto_id_idx on public.interacciones (prospecto_id);

-- obtenerEstadoProyecto/listado de movimientos filtran por proyecto_id
-- constantemente (incluido "is null" para gastos fijos del negocio).
create index movimientos_contables_proyecto_id_idx on public.movimientos_contables (proyecto_id);

-- listado de propiedades con filtro por disponibilidad + conteo de KPIs.
create index propiedades_estado_disponibilidad_idx on public.propiedades (estado_disponibilidad);
