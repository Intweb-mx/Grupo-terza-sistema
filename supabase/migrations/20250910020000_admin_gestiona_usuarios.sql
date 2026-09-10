-- Dueño y administrador pueden editar usuarios existentes
-- (activar/desactivar, cambiar rol). El alta de cuentas nuevas se hace
-- vía Supabase Admin API (service_role, servidor) en lib/server/usuarios.ts —
-- esta policy cubre la edición posterior desde la app.
create policy "Admin edita usuarios" on public.usuarios
  for update using (
    public.usuario_rol_actual() in ('dueno','administrador')
  );
