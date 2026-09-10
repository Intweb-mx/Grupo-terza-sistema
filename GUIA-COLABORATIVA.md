# Guía colaborativa — Sistema Inmobiliario

**Dos personas. Backend + Frontend. GitHub + Supabase + Vercel.**

Cada fase tiene un inicio, un fin reconocible y una definición de «terminado». Nadie arranca la siguiente fase sin cerrar la anterior. El humano elige qué fase sigue.

---

## Cómo leer esta guía

```
B = Backend lo hace
F = Frontend lo hace
B+F = los dos juntos o en paralelo
⚡ = punto de coordinación — hablar antes de continuar
✅ = criterio de «fase terminada»
```

---

## FASE 0 · Preparación

> Objetivo: los dos con el mismo entorno, accesos y herramientas. Sin esto no hay Fase 1.

### B+F — Una sola vez, juntos

**1. Accesos**

```
□ GitHub: ambos como collaborators en Intweb-mx/Grupo-terza-sistema
□ Supabase: ambos invitados al proyecto (Settings → Team)
□ Vercel: ambos invitados al proyecto
```

**2. Herramientas locales**

```bash
# Node 20+
node --version

# Supabase CLI
brew install supabase/tap/supabase
supabase --version

# GitHub CLI
brew install gh
gh auth login

# Vercel CLI
npm i -g vercel
vercel login
```

**3. Clonar el repo**

```bash
git clone https://github.com/Intweb-mx/Grupo-terza-sistema.git
cd Grupo-terza-sistema
```

**4. Variables de entorno — ⚡ definir juntos**

El backend crea el proyecto en Supabase y comparte con el frontend:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        ← solo backend, nunca al cliente
SUPABASE_DB_PASSWORD=             ← solo backend
```

Crear `.env.local` localmente. **Nunca commitear este archivo.**
Agregar `.env.local` a `.gitignore` si no está.

✅ **Fase 0 terminada cuando:**
- Ambos pueden hacer `git pull` y ver el mismo código
- Ambos tienen acceso a Supabase y Vercel
- Ambos tienen `.env.local` funcionando

---

## FASE 1 · Fundación del proyecto

> Objetivo: Next.js corriendo, Supabase conectado, Vercel desplegando. Sin datos de negocio todavía.

### B — Supabase: estructura base

```bash
supabase init
supabase start
```

**Migración 001 — tablas base:**

```sql
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
```

**Generar tipos:**

```bash
supabase gen types typescript --local > types/supabase.ts
```

**Crear script `verify`** en `package.json`:

```json
"scripts": {
  "verify": "tsc --noEmit && next lint"
}
```

### F — Next.js: estructura inicial

```bash
# Desde la raíz del repo
npx create-next-app@latest . --typescript --tailwind --app --src-dir no --import-alias "@/*"
```

**Estructura de carpetas a crear:**

```bash
mkdir -p app/api \
  components/ui \
  components/propiedades \
  components/cartera \
  components/contratos \
  components/crm \
  components/contabilidad \
  components/reportes \
  lib/server \
  lib/supabase \
  lib/utils
```

**Cliente de Supabase** (`lib/supabase/client.ts`):

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Cliente servidor** (`lib/supabase/server.ts`):

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}
```

### B+F — Conectar Vercel ⚡

Uno de los dos (backend) conecta el repositorio con Vercel:

```bash
vercel link
```

Agregar variables de entorno en Vercel Dashboard → Settings → Environment Variables.
`SUPABASE_SERVICE_ROLE_KEY` solo en entorno Server (no exponer al cliente).

✅ **Fase 1 terminada cuando:**
- `npm run dev` corre sin errores en ambas computadoras
- `npm run verify` pasa en verde
- Vercel tiene un deploy de `main` activo
- `types/supabase.ts` generado y committado

---

## FASE 2 · Autenticación y roles

> Objetivo: login funcional, sesión persistente, rutas protegidas por rol.

### B — Backend auth

**Migración 002 — trigger para crear usuario al registrarse:**

```sql
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
```

**RLS en usuarios:**

```sql
alter table public.usuarios enable row level security;

-- Usuario ve su propio perfil
create policy "Ver propio perfil" on public.usuarios
  for select using (auth.uid() = id);

-- Dueño y administrador ven todos
create policy "Admin ve todos" on public.usuarios
  for select using (
    exists (select 1 from public.usuarios where id = auth.uid() and rol in ('dueno','administrador'))
  );
```

**Server Action** (`lib/server/auth.ts`):

```typescript
'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getUsuarioActual() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
  return data
}
```

⚡ **Definir contrato con Frontend:**

```
GET /api/auth/me
→ { id, nombre, email, rol, activo } | null
```

### F — Frontend auth

**Página de login** (`app/login/page.tsx`):
- Formulario email + contraseña
- Llamada a `supabase.auth.signInWithPassword()`
- Redirect a `/dashboard` si sesión activa

**Middleware** (`middleware.ts`):

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // proteger rutas /dashboard y /api (excepto /api/auth)
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/((?!auth).*)']
}
```

**Layout con rol** (`app/dashboard/layout.tsx`):
- Leer usuario actual del Server Action
- Renderizar navegación según rol
- Redirect a `/login` si no hay sesión

✅ **Fase 2 terminada cuando:**
- Login funciona y redirige al dashboard
- Ruta protegida sin sesión redirige a `/login`
- Usuario con rol `asesor` no ve rutas de `contador`
- `npm run verify` pasa

---

## FASE 3 · Propiedades

> Objetivo: catálogo de inmuebles completo con CRUD y mapa visual de lotes.

### B — Backend propiedades

**Migración 003:**

```sql
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
    exists (select 1 from public.usuarios where id = auth.uid() and rol in ('dueno','administrador'))
  );
```

**API routes** (`app/api/propiedades/route.ts` y `app/api/propiedades/[id]/route.ts`):
Implementar GET, POST, PUT siguiendo el contrato del CLAUDE.md.

**Trigger audit_log** para propiedades (reutilizable para otras tablas):

```sql
create or replace function public.registrar_auditoria()
returns trigger language plpgsql as $$
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
```

### F — Frontend propiedades

- `/propiedades` — listado con filtros (tipo, ciudad, precio, disponibilidad)
- `/propiedades/[id]` — ficha detalle con galería
- `/propiedades/nueva` — formulario de alta (solo roles con permiso)
- `/propiedades/[id]/editar` — formulario de edición
- Mapa visual de lotes (grid o SVG por manzana) con color por disponibilidad

⚡ **Coordinar:** el mapa visual necesita que backend defina la estructura de `lote_id` (ej: `"MZ-A-01"`, `"MZ-A-02"`).

✅ **Fase 3 terminada cuando:**
- CRUD de propiedades funciona con permisos correctos
- Mapa visual muestra estado de cada lote
- Cada cambio genera fila en `audit_log`
- `npm run verify` + `npm run build` pasan

---

## FASE 4 · Clientes y contratos

> Objetivo: alta de clientes, firma de contratos, vinculación con propiedad.

### B — Backend clientes y contratos

**Migración 004:**

```sql
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

-- Al activar contrato, marcar propiedad como vendida/rentada
create or replace function public.actualizar_disponibilidad_propiedad()
returns trigger language plpgsql as $$
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
```

RLS + audit triggers para ambas tablas.

### F — Frontend clientes y contratos

- `/clientes` — listado con buscador
- `/clientes/[id]` — ficha con contratos activos y historial
- `/clientes/nuevo` — formulario de alta
- `/contratos/nuevo` — wizard: elegir cliente → elegir propiedad → tipo de contrato → monto y plazo → confirmar

⚡ **Coordinar:** el wizard necesita que backend defina el endpoint de creación de contrato exacto (qué campos son obligatorios según el tipo).

✅ **Fase 4 terminada cuando:**
- Se puede dar de alta un cliente y un contrato vinculado
- Al crear contrato de compraventa, propiedad cambia a «vendido»
- Audit log registra todos los cambios

---

## FASE 5 · Motor de amortización

> Esta es la fase más crítica del sistema. El cálculo de cuotas quincenales es la pieza central de todo el módulo de cobranza.

### B — Backend amortización

**Migración 005:**

```sql
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
```

**Lógica del motor** (`lib/server/amortizacion.ts`):

```typescript
// Reglas:
// - Cortes: día 1 y 16 de cada mes
// - Capital = (monto_total - enganche) / plazo_quincenas
// - Penalización: 30000 centavos ($300 MXN) al día 3 de atraso, una sola vez por período
// - Reestructura: interés 3% mensual sobre saldo insoluto, nuevo calendario

export function calcularFechaCorte(fecha: Date): Date {
  // Retorna el próximo día 1 o 16 desde la fecha dada
}

export function generarCalendario(contrato: Contrato): AmortizacionRow[] {
  // Genera el array completo de cuotas quincenales
}

export function calcularReestructura(
  saldoInsoluto: number,        // centavos
  cuotasRestantes: number
): AmortizacionRow[] {
  // 3% mensual = 1.5% quincenal sobre saldo insoluto
}
```

**Server Action para generar calendario** al crear contrato:

```typescript
// Al hacer POST /api/contratos → automáticamente genera amortizaciones
```

⚡ **Coordinar con Frontend:** el frontend necesita saber exactamente qué campos tiene cada fila del calendario para mostrar la tabla de pagos.

### F — Frontend amortización

- Tabla de amortización en ficha del cliente: número de pago, fecha de corte, capital, interés, penalización, total, estado, fecha de pago real
- Badge visual por estado (pendiente / pagado / vencido)
- Resumen: total pagado, saldo pendiente, próxima fecha de corte

✅ **Fase 5 terminada cuando:**
- Al crear un contrato de compraventa se genera automáticamente el calendario completo
- Los cortes caen exactamente en días 1 y 16
- El total de cuotas × monto por cuota = monto_total - enganche
- `npm run verify` + `npm run build` pasan

---

## FASE 6 · Cobranza: pagos, penalizaciones y reestructura

> Objetivo: registrar pagos, aplicar penalizaciones automáticas, reestructurar adeudos vencidos.

### B — Backend cobranza

**Migración 006:**

```sql
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
```

**Server Actions** (`lib/server/cobranza.ts`):

```typescript
// registrarPago: aplica el pago a la amortización correspondiente
// marcarPenalizacion: al cumplirse 3 días de atraso, insertar en penalizaciones
//   y sumar al campo penalizacion de la amortización — solo si no existe ya
// reestructurarContrato: calcula nuevo calendario con 3% mensual sobre saldo insoluto
//   marca amortizaciones anteriores como 'reestructurado'
//   inserta nuevas amortizaciones
```

**Cron job** (Supabase Edge Function o GitHub Action diaria):

```
Cada día a las 8am:
  1. Buscar amortizaciones con fecha_corte <= hoy - 3 días y estado = 'pendiente'
  2. Aplicar penalización si no fue aplicada ya
  3. Enviar recordatorio si fecha_corte = hoy + 3 días
```

**API:**

```
GET  /api/clientes/:id/saldo
     → { saldo_pendiente, dias_atraso, penalizacion_aplicada, proxima_fecha_corte }

POST /api/pagos
     ← { cliente_id, contrato_id, monto, fecha, referencia, metodo_pago }
     → { id, saldo_restante }

POST /api/clientes/:id/reestructura
     → { nuevo_calendario, fecha_aplicacion, interes_aplicado, cuotas_generadas }
```

### F — Frontend cobranza

- Botón «Registrar pago» en ficha de cliente → modal con monto, fecha, referencia, método
- Indicador visual de días de atraso (badge rojo si > 0, naranja si > 3)
- Botón «Reestructurar» (solo roles con permiso) → confirmación con detalle del nuevo plan
- `/clientes/:id` muestra saldo actualizado en tiempo real después de registrar pago

✅ **Fase 6 terminada cuando:**
- Pago registrado descuenta el saldo correctamente
- Penalización no se duplica en el mismo período
- Reestructura genera nuevo calendario y el anterior queda marcado como «reestructurado»
- Audit log registra cada pago y cada reestructura

---

## FASE 7 · CRM / Prospectos

> Objetivo: captación de leads, embudo de ventas por asesor, historial de interacciones.

### B — Backend CRM

**Migración 007:**

```sql
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
```

RLS: asesor solo ve sus propios prospectos. Administrador y dueño ven todos.

**API:**

```
GET  /api/prospectos          → filtrable por asesor_id, etapa, fuente
POST /api/prospectos
POST /api/prospectos/:id/interaccion
PUT  /api/prospectos/:id/etapa
```

### F — Frontend CRM

- `/prospectos` — lista con filtros y kanban de etapas (columnas drag-and-drop)
- `/prospectos/[id]` — ficha con historial de interacciones cronológico
- Formulario de nueva interacción en la misma página (sin cambiar de ruta)
- Panel de asesor: sus prospectos, su embudo, sus métricas del mes

✅ **Fase 7 terminada cuando:**
- Asesor solo ve sus prospectos, no los de otros
- Cambio de etapa se refleja en el kanban sin recargar
- Cada interacción queda registrada con fecha, tipo y notas

---

## FASE 8 · Contabilidad y CFDI

> Objetivo: contabilidad separada por proyecto, conciliación bancaria, timbrado de CFDI a través de PAC.

### B — Backend contabilidad

**Migración 008:**

```sql
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
  created_at timestamptz default now()
);
```

**Integración CFDI** (`lib/server/cfdi.ts`):

```typescript
// Llamada al PAC (ej: Facturama, SW Sapien, Diverza)
// Nunca generar XML directamente
// El UUID del timbrado se guarda en movimientos_contables.cfdi_uuid
// Una vez timbrado: no editable
// Cancelación: solo con motivo SAT válido (01, 02, 03, 04)
```

⚡ **Coordinar:** el frontend necesita saber qué campos pedir en el formulario de facturación según el tipo de contrato.

### F — Frontend contabilidad

- `/contabilidad` — movimientos del período con filtros
- `/contabilidad/proyectos/[id]` — estado financiero por proyecto: ingresos, gastos, utilidad
- `/contabilidad/cfdi` — listado de facturas emitidas con estado (vigente/cancelada)
- Botón «Emitir CFDI» en ficha de pago recibido

✅ **Fase 8 terminada cuando:**
- Movimiento de ingreso se registra al recibir un pago
- CFDI se timbra a través del PAC y el UUID queda guardado
- No se puede editar un CFDI ya timbrado
- Utilidad por proyecto = ingresos - gastos asignados al proyecto

---

## FASE 9 · Reportes y panel ejecutivo

> Objetivo: KPIs, cartera vencida, proyección de flujo, proyección económica.

### B — Backend reportes

Queries SQL para el panel (pueden ser Supabase RPC o API routes):

```sql
-- KPIs principales
select
  count(*) filter (where estado_disponibilidad = 'disponible') as propiedades_disponibles,
  count(*) filter (where estado_disponibilidad = 'vendido') as propiedades_vendidas,
  sum(monto) filter (where fecha >= date_trunc('month', now())) as ingresos_mes_actual
from ...;

-- Cartera vencida
select c.nombre, a.fecha_corte, a.total, a.penalizacion,
  current_date - a.fecha_corte as dias_atraso
from amortizaciones a
join contratos ct on a.contrato_id = ct.id
join clientes c on ct.cliente_id = c.id
where a.estado = 'pendiente' and a.fecha_corte < current_date
order by dias_atraso desc;

-- Proyección de flujo: próximas 12 quincenas
select fecha_corte, sum(total) as cobro_esperado
from amortizaciones
where estado = 'pendiente' and fecha_corte >= current_date
group by fecha_corte
order by fecha_corte
limit 24;
```

**API:**

```
GET /api/reportes/kpis
GET /api/reportes/cartera-vencida
GET /api/reportes/flujo-proyectado
GET /api/contabilidad/proyectos/:id/estado
```

### F — Frontend panel ejecutivo

- `/dashboard` — página principal con tarjetas de KPIs
- Gráfica de flujo proyectado (barras por quincena)
- Tabla de cartera vencida ordenada por días de atraso
- Gráfica de embudo de ventas (CRM) por asesor
- Proyección económica por proyecto con participación por socio

✅ **Fase 9 terminada cuando:**
- Dashboard carga en menos de 2 segundos
- Cartera vencida coincide con suma manual de amortizaciones vencidas
- Proyección suma correctamente las cuotas futuras pendientes

---

## FASE 10 · Portal de autoservicio

> Objetivo: el cliente ve su saldo, historial de pagos y puede descargar su estado de cuenta.

### B — Backend portal

- Auth separada para clientes (rol `cliente`, diferente a usuarios internos)
- RLS: cliente solo ve sus propios datos — sus amortizaciones, sus pagos, su contrato
- API de solo lectura para el portal:

```
GET /api/portal/saldo          → saldo_pendiente, proxima_fecha, dias_atraso
GET /api/portal/amortizacion   → calendario completo del contrato
GET /api/portal/pagos          → historial de pagos
GET /api/portal/estado-cuenta  → PDF generado en servidor
```

### F — Frontend portal

- `/portal/login` — acceso separado (email del cliente)
- `/portal` — dashboard del cliente: saldo, próxima fecha de pago, historial
- Descarga de estado de cuenta en PDF
- Sin acceso a ninguna ruta del panel administrativo

✅ **Fase 10 terminada cuando:**
- Cliente ve solo sus datos
- No puede ver datos de otros clientes (probar con dos cuentas)
- Estado de cuenta descargable con todos los movimientos

---

## Flujo diario para los dos

```
Mañana:
  git checkout main
  git pull
  supabase db reset --local   (si hubo migraciones nuevas)
  npm run verify

Durante el día:
  git checkout -b feature/[backend|frontend]-nombre-concreto
  trabajar con Claude Code usando el contrato de sesión del CLAUDE.md
  npm run verify antes de cada commit

Al terminar:
  git add [archivos específicos]
  git commit -m "descripción concreta"
  git push -u origin feature/nombre
  abrir Pull Request en GitHub

El otro revisa:
  si está bien → Approve → Merge
  si no → comentar en el PR, no en WhatsApp

Después del merge:
  git checkout main
  git pull
  (ambos)
```

---

## Orden recomendado de fases

```
FASE 0  Preparación          ← sin esto nada funciona
FASE 1  Fundación            ← sin esto nada corre
FASE 2  Auth y roles         ← sin esto no hay seguridad
FASE 3  Propiedades          ← el catálogo base
FASE 4  Clientes y contratos ← la relación comercial
FASE 5  Motor de amortización← el corazón del sistema ⚠️ más complejo
FASE 6  Cobranza             ← pagos, penalizaciones, reestructura
FASE 7  CRM                  ← captación de prospectos (puede ser paralela a 5-6)
FASE 8  Contabilidad + CFDI  ← fiscal
FASE 9  Reportes             ← panel ejecutivo
FASE 10 Portal cliente       ← autoservicio
```

Las fases 0–4 son bloqueantes: cada una necesita la anterior.
Las fases 7–10 pueden moverse o trabajarse en paralelo si el equipo está coordinado.

---

## Regla de oro

> **Antes de empezar cualquier fase: leer el CLAUDE.md, llenar el contrato de sesión, declarar qué archivos vas a tocar.**

> **Al terminar cualquier fase: `npm run verify`, `npm run build`, actualizar el estado del proyecto.**

> **Si algo cuesta más de dos horas sin avanzar: parar, escribir lo que se sabe, pedir ayuda. No seguir en círculos.**
