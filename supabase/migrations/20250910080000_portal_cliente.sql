-- Cierre de un hueco de seguridad antes de habilitar login de clientes:
-- varias policies dicen "cualquier autenticado" (auth.uid() is not null)
-- pensando solo en personal interno. En cuanto un cliente tenga su propia
-- cuenta, esas policies le abrirían lectura a TODAS las propiedades,
-- clientes, contratos, pagos y penalizaciones del negocio, no solo lo suyo.
-- Se restringen a "es personal interno" (existe en public.usuarios).
alter policy "Ver propiedades" on public.propiedades
  using (public.usuario_rol_actual() is not null);

alter policy "Ver clientes" on public.clientes
  using (public.usuario_rol_actual() is not null);

alter policy "Ver contratos" on public.contratos
  using (public.usuario_rol_actual() is not null);

alter policy "Ver amortizaciones" on public.amortizaciones
  using (public.usuario_rol_actual() is not null);

alter policy "Ver pagos" on public.pagos
  using (public.usuario_rol_actual() is not null);

alter policy "Ver penalizaciones" on public.penalizaciones
  using (public.usuario_rol_actual() is not null);

-- Vínculo entre un cliente y su cuenta de portal (auth.users). Nullable:
-- no todos los clientes tienen acceso al portal todavía.
alter table public.clientes add column user_id uuid references auth.users(id) unique;

-- El cliente ve su propio registro en la tabla clientes (necesario para
-- que las rutas /api/portal/* puedan resolver "quién soy" antes de pedirle
-- sus datos al cliente admin).
create policy "Cliente ve su propio registro" on public.clientes
  for select using (user_id = auth.uid());

-- El trigger de fase 2 asumía que todo alta en auth.users es personal
-- interno (usuarios.rol). Se extiende: si la invitación viene marcada como
-- tipo=cliente, en vez de insertar en usuarios se vincula el user_id al
-- cliente correspondiente — un cliente nunca debe terminar en la tabla
-- usuarios (eso le daría acceso a las policies de rol interno).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  if new.raw_user_meta_data->>'tipo' = 'cliente' then
    update public.clientes
    set user_id = new.id
    where id = (new.raw_user_meta_data->>'cliente_id')::uuid;
  else
    insert into public.usuarios (id, nombre, email, rol)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'nombre', ''),
      new.email,
      coalesce(new.raw_user_meta_data->>'rol', 'asesor')
    );
  end if;
  return new;
end;
$$;
