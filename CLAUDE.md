# CLAUDE.md — Sistema Inmobiliario

## Proyecto

Sistema de gestión inmobiliaria con seis módulos:

1. **Contabilidad general** — CFDI/SAT, conciliación bancaria, reportes financieros, contabilidad separada por proyecto, reparto de utilidades entre socios
2. **Cartera de clientes y cobranza** — amortización quincenal, recordatorio automático, penalización, reestructura, portal de autoservicio
3. **Propiedades y contratos** — catálogo de inmuebles, mapa visual de lotes, contratos de compraventa / arrendamiento / renta temporal
4. **CRM / Prospectos** — captación de leads, embudo de ventas por asesor, historial de interacciones
5. **Reportes y panel ejecutivo** — KPIs, cartera vencida, proyección de flujo, proyección económica por proyecto
6. **Roles, permisos y auditoría** — dueño, socio, administrador, asesor, contador; registro de auditoría de todos los cambios

---

## Principio de producto

> ¿Esto ayuda a gestionar el negocio inmobiliario o a cumplir obligaciones fiscales mexicanas?

Si la respuesta no es evidente, va a *Diferido* y no se implementa.

### Fuera de alcance permanente

- Firma electrónica avanzada (FIEL) — regulación SAT específica, no es responsabilidad del sistema
- Timbrado de CFDI directamente — siempre a través del PAC configurado, nunca generación propia de XML
- Marketplace público de propiedades
- Integración bancaria directa / open banking
- Firma de contratos digitales con validez legal (e.firma SAT)

Si aparecen en una propuesta comercial, se corrige la propuesta, no el alcance.

---

## Stack

```
Next.js 14+      App Router, Server Actions
TypeScript       strict mode, sin any implícito
Supabase         base de datos, auth, RLS, storage
Vercel           despliegue, preview por PR
Tailwind CSS     estilos
```

---

## Equipo y responsabilidades

| Rol | Dueño principal |
|---|---|
| **Backend** | Supabase schema, migraciones, RLS, Auth, Server Actions, API routes, validaciones de negocio, tipos generados |
| **Frontend** | Componentes, páginas, navegación, layout, estados visuales, formularios (parte visual), responsive |

«Dueño principal» no significa exclusividad: significa que cuando hay duda sobre cómo hacerlo, esa persona decide.

---

## Reglas de Git

- `main` está protegida — nunca `git push origin main` directamente
- Todo entra por Pull Request con review del otro integrante
- Convención de ramas: `feature/backend-*` y `feature/frontend-*`
- PR que modifica el contrato API requiere review explícito de los dos
- Después de cada merge: `git checkout main && git pull` — la computadora no se actualiza sola

---

## Reglas para Claude Code

### General

- No instalar dependencias sin preguntar
- No modificar archivos fuera de los declarados en el contexto de sesión
- No modificar variables de entorno
- No hacer `git push` ni `git commit` sin indicación explícita
- Si detectas una decisión de arquitectura cuestionable, detente y propón la alternativa — no implementes

### Backend

- El schema de Supabase lo decide el backend, siempre — el frontend pide, el backend decide la estructura
- Tipos se generan con `supabase gen types typescript`, nunca se escriben a mano
- Toda lógica de negocio va en `/lib/server/` — nunca en componentes del cliente
- Nunca exponer `service_role` key al cliente bajo ninguna circunstancia
- RLS obligatorio en todas las tablas de negocio — cerrar las tres capas: política de acceso, permiso de tabla, permiso de función
- Migraciones numeradas secuencialmente — solo el backend las crea

### Frontend

- Nunca acceder a Supabase directamente desde componentes cliente — usar Server Actions o API routes
- Componentes en `/components/` organizados por módulo (`/components/cartera/`, `/components/propiedades/`, etc.)
- Formularios solo consumen el API — no deciden estructura de datos ni llaman a Supabase directamente

### Seguridad

- Verificar RLS en producción después de cada migración — no solo en local, con script, no a mano
- Auditoría: toda escritura en `contratos`, `pagos`, `propiedades`, `clientes` genera fila en `audit_log`
- En incidente: contener primero (revocar llave, apagar ruta), diagnosticar después

### Moneda y fechas

- **Todos los montos en centavos (integer)** — nunca float para dinero; `$300 MXN = 30000`
- Moneda MXN por defecto
- Fechas en UTC en la base, conversión a zona horaria del usuario en el cliente (America/Mexico_City)
- Cortes quincenales: días 1 y 16 de cada mes

### CFDI / SAT

- No generar XML de CFDI directamente — siempre a través del PAC configurado
- UUID del timbrado es inmutable — nunca permitir edición posterior
- Cancelación solo con motivo SAT válido: 01 (comprobante emitido con errores con relación), 02 (comprobante emitido con errores sin relación), 03 (no se llevó a cabo la operación), 04 (operación nominativa relacionada en factura global)

---

## Reglas de negocio críticas

Estas reglas no tienen excepción. Si algo parece contradecirlas, preguntar antes de implementar.

1. **Penalización** — $300 MXN (30000 centavos) al llegar exactamente a 3 días de atraso. Se aplica una sola vez por período quincenal, no acumula por día.

2. **Reestructura automática** — al vencer el plazo con saldo insoluto: nuevo calendario de amortización con interés del 3% mensual sobre el **saldo insoluto**, no sobre el monto original del contrato.

3. **Recordatorio automático** — 3 días antes de cada corte quincenal. Canal por cliente (email / SMS / WhatsApp), configurable. El recordatorio no es opcional si el cliente tiene saldo pendiente.

4. **Reparto de utilidades** — calculado sobre contabilidad separada por proyecto (gastos fijos asignados proporcionalmente), no sobre ingresos totales del negocio.

5. **Registro de auditoría** — todo cambio en tablas críticas genera fila en `audit_log` con: `usuario_id`, `tabla`, `registro_id`, `campo`, `valor_anterior`, `valor_nuevo`, `timestamp`. Sin excepción. No hay operación de escritura sin registro.

---

## Contrato API — módulos principales

Este contrato se define antes de implementar. Cualquier cambio requiere actualizar este archivo y avisar al otro integrante.

### Usuarios

No hay signup público. Las cuentas se crean por invitación — solo `dueno` y
`administrador` pueden invitar. El invitado recibe un email (vía Supabase Auth)
con link para fijar su contraseña.

```
POST /api/usuarios/invitar
     ← { nombre, email, rol: "dueno" | "socio" | "administrador" | "asesor" | "contador" }
     → { id, email, invitado_en }
     Solo dueno/administrador — 403 si no.
```

### Portal de cliente

Auth separada de personal interno: un cliente con cuenta de portal NUNCA
tiene fila en `usuarios` (si la tuviera, heredaría las policies de rol
interno). Se identifica por `clientes.user_id`. Invitación análoga a
usuarios pero con metadata `{ tipo: "cliente", cliente_id }`, que le indica
al trigger `handle_new_user()` que vincule `user_id` en vez de crear una
fila en `usuarios`.

```
POST /api/clientes/:id/invitar
     → { id, email, invitado_en }
     Solo dueno/administrador — 403 si no. El cliente debe tener email.

GET  /api/portal/saldo
     → { saldo_pendiente, dias_atraso, proxima_fecha }

GET  /api/portal/amortizacion
     → [{ numero_pago, fecha_corte, capital, interes, penalizacion, total, estado, fecha_pago_real }]

GET  /api/portal/pagos
     → [{ id, monto, fecha, referencia, metodo_pago }]

GET  /api/portal/estado-cuenta      — pendiente, necesita elegir librería de PDF
```

⚡ **Coordinar con Frontend:** las rutas `/api/portal/*` pasan por el mismo
`proxy.ts` que el resto de `/api/*` (excepto `/api/auth` y `/api/cron`) — si
no hay sesión, redirige a `/login` (la de personal interno), no a
`/portal/login`. El portal necesita su propia página de login y su propia
lógica de protección de rutas bajo `/portal/*`, separada de `proxy.ts`.

### Propiedades

```
GET  /api/propiedades
     → [{ id, titulo, precio, superficie_m2, tipo, ciudad, estado_disponibilidad, imagen_url }]

GET  /api/propiedades/:id
     → { ...campos anteriores, descripcion, galeria: string[], contratos_activos: number, lote_id }

POST /api/propiedades
     ← { titulo, precio, superficie_m2, tipo, direccion, ciudad, descripcion }
     → { id, created_at }

PUT  /api/propiedades/:id
     ← { campos parciales }
     → { updated_at }
```

### Clientes y cartera

```
GET  /api/clientes
     → [{ id, nombre, apellidos, lote_id, propiedad_id, saldo_pendiente, proxima_fecha_corte, estado_pago }]
     saldo_pendiente, proxima_fecha_corte y estado_pago son null hasta fase 5
     (dependen de la tabla amortizaciones, que todavía no existe)

GET  /api/clientes/:id
     → { id, nombre, apellidos, email, telefono, rfc, direccion, ciudad,
          contratos: [{ id, tipo, propiedad_id, fecha_inicio, fecha_fin, monto_total, estado }] }

POST /api/clientes
     ← { nombre, apellidos, email, telefono, rfc, direccion, ciudad }
     → { id, created_at }

GET  /api/clientes/:id/amortizacion
     → [{ numero_pago, fecha_corte, capital, interes, penalizacion, total, estado, fecha_pago_real }]

GET  /api/clientes/:id/saldo
     → { saldo_pendiente, dias_atraso, penalizacion_aplicada, proxima_fecha_corte }

POST /api/pagos
     ← { cliente_id, monto, fecha, referencia, metodo_pago }
     → { id, saldo_restante, created_at }

POST /api/clientes/:id/reestructura
     → { nuevo_calendario: [...], fecha_aplicacion, interes_aplicado, cuotas_generadas }
     Solo dueno/administrador. Rechaza si el plazo del contrato no venció
     todavía (regla de negocio: reestructura solo procede al vencer el
     plazo con saldo insoluto).
```

### Cron interno (no es parte del API pública)

```
POST /api/cron/penalizaciones
     Header: x-cron-secret: <CRON_SECRET>
     → { revisadas, penalizaciones_aplicadas }
     Disparado diario por un scheduler externo (Vercel Cron / GitHub
     Action), no por un usuario — se autentica con CRON_SECRET, no con
     sesión. Aplica $300 MXN a las cuotas que llegan exactamente a 3 días
     de atraso. Idempotente (no duplica si corre dos veces el mismo día).
```

### Contratos

```
GET  /api/contratos
     → [{ id, tipo, cliente_id, propiedad_id, fecha_inicio, fecha_fin, estado, monto_total }]

POST /api/contratos
     ← { tipo: "compraventa" | "arrendamiento" | "renta_temporal",
          cliente_id, propiedad_id, fecha_inicio, monto_total, plazo_meses, ... }
     → { id, created_at }
```

### CRM / Prospectos

```
GET  /api/prospectos
     → [{ id, nombre, telefono, etapa, asesor_id, ultima_interaccion, interes }]

POST /api/prospectos
     ← { nombre, telefono, email, interes, asesor_id, fuente }
     → { id, created_at }

POST /api/prospectos/:id/interaccion
     ← { tipo: "llamada" | "visita" | "whatsapp" | "email", notas }
     → { id, created_at }

PUT  /api/prospectos/:id/etapa
     ← { etapa: "nuevo" | "contactado" | "interesado" | "negociacion" | "cerrado" | "perdido" }
     → { updated_at }
```

### Contabilidad

Gastos fijos se reparten entre proyectos activos en proporción a los
ingresos de cada uno respecto al total del negocio (regla de negocio #4) —
no en partes iguales, no sobre ingresos totales.

CFDI: sin PAC conectado todavía (Facturama/SW Sapien/Diverza pendiente de
elegir). `lib/server/cfdi.ts` tiene la interfaz lista (`emitirCfdi`,
`cancelarCfdi`) pero lanza error hasta que se configure un proveedor.

```
GET  /api/contabilidad/proyectos/:id/estado
     → { ingresos, gastos_fijos, gastos_variables, utilidad_bruta, utilidad_neta }

GET  /api/contabilidad/movimientos
     → [{ id, proyecto_id, tipo, categoria, descripcion, monto, fecha, referencia, cfdi_uuid, cfdi_estado }]
     Filtrable por ?proyecto_id=

POST /api/contabilidad/movimientos
     ← { proyecto_id, tipo: "ingreso" | "egreso", categoria, descripcion, monto, fecha, referencia }
     → { id, created_at }
```

### Reportes y panel ejecutivo

Solo dueño, administrador o contador — 403 para cualquier otro rol (incluido
asesor, que tiene su propio embudo en CRM pero no ve KPIs de todo el negocio).

```
GET  /api/reportes/kpis
     → { propiedades_disponibles, propiedades_vendidas, ingresos_mes_actual,
          clientes_en_mora, monto_cartera_vencida }

GET  /api/reportes/cartera-vencida
     → [{ cliente_id, nombre, dias_atraso, monto_vencido, penalizacion_aplicada }]
     Un renglón por cliente (agrega todas sus cuotas vencidas), ordenado por
     días de atraso descendente.

GET  /api/reportes/flujo-proyectado
     → [{ mes, ingresos_esperados, egresos_esperados, saldo_proyectado }]
     Próximos 12 meses agrupados. egresos_esperados siempre es 0 — no existe
     una tabla de presupuesto/gastos futuros, solo histórico ya ocurrido en
     movimientos_contables. saldo_proyectado = ingresos_esperados por ahora.
```

---

## Contrato de sesión

Completar al inicio de cada tarea con Claude Code:

```
Rama: feature/[backend|frontend]-...
Responsable: [backend | frontend]
Tarea concreta: ...
Archivos que puedo tocar: ...
Archivos que NO puedo tocar: ...
¿Modifica el contrato API?: [sí / no]
  Si sí → coordinar con el otro integrante antes de implementar
```

---

## Comandos

```bash
# Verificación antes de cada commit
npm run verify          # tipos + linter + compilación aislada

# Al retomar el proyecto
git checkout main && git pull
supabase start
supabase db reset --local
npm run verify

# Para pruebas de navegador: siempre build de producción
npm run build && npm run start
# Nunca: npm run dev para correr pruebas de integración

# Generar tipos de Supabase
supabase gen types typescript --local > types/supabase.ts
```

---

## Estructura de carpetas

```
/app
  /api                  ← API routes (backend)
    /propiedades/
    /clientes/
    /contratos/
    /prospectos/
    /contabilidad/
  /dashboard/           ← páginas del panel (frontend)
  /propiedades/
  /clientes/
  /contratos/
  /prospectos/

/components             ← componentes UI (frontend)
  /ui/                  ← primitivos reutilizables
  /propiedades/
  /cartera/
  /contratos/
  /crm/
  /contabilidad/
  /reportes/

/lib
  /server/              ← lógica de negocio (backend)
    /amortizacion.ts    ← motor de cálculo quincenal
    /penalizaciones.ts
    /reestructura.ts
    /cfdi.ts
  /supabase/            ← cliente y helpers de Supabase
  /utils/               ← utilidades compartidas (fechas, moneda)

/supabase
  /migrations/          ← migraciones numeradas, solo el backend las crea

/types
  /supabase.ts          ← generado, nunca editado a mano
```

---

## Tablas críticas de Supabase

```
propiedades         catálogo de inmuebles
lotes               subdivisión visual del terreno
clientes            compradores y arrendatarios
contratos           compraventa, arrendamiento, renta temporal
amortizaciones      calendario de pagos por contrato
pagos               registro de pagos recibidos
penalizaciones      registro de penalizaciones aplicadas
prospectos          leads del CRM
interacciones       historial de contacto por prospecto
cuentas_contables   plan de cuentas
movimientos         asientos contables
proyectos           agrupación para contabilidad separada
socios              socios del negocio y % de participación
audit_log           registro de auditoría — nunca se borra
usuarios            vinculado a auth.users de Supabase
```

---

## Lo que no resuelve este archivo

- No sustituye la comunicación entre integrantes cuando el contrato API cambia
- No detecta si una migración falló en producción — verificar con script después de cada deploy
- No reemplaza conocer la regulación fiscal mexicana — SAT, NOM, IMSS tienen reglas que el código no puede inferir
