-- ============================================================================
-- RLS POLICIES — Biomed HUSJ
-- Ejecutar en Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================
-- IMPORTANTE: Antes de ejecutar, verificá que las tablas tengan user_id donde corresponda.
-- Si no existe la columna user_id en alguna tabla, agregala primero (ver sección al final).
-- ============================================================================

-- 1. HABILITAR RLS en todas las tablas
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correctivos_husj ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. POLÍTICAS PARA equipments (inventario compartido)
--    Todos los autenticados pueden leer. Solo autenticados pueden modificar.
-- ============================================================================

-- SELECT: cualquier usuario autenticado puede ver el inventario
CREATE POLICY "equipments_select_authenticated" ON public.equipments
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: cualquier usuario autenticado puede insertar
CREATE POLICY "equipments_insert_authenticated" ON public.equipments
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- UPDATE: cualquier usuario autenticado puede actualizar
CREATE POLICY "equipments_update_authenticated" ON public.equipments
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: cualquier usuario autenticado puede eliminar
CREATE POLICY "equipments_delete_authenticated" ON public.equipments
  FOR DELETE TO authenticated
  USING (true);

-- ============================================================================
-- 3. POLÍTICAS PARA maintenance_logs
--    Usuarios solo pueden modificar sus propios registros.
-- ============================================================================

-- SELECT: todos los autenticados pueden ver
CREATE POLICY "logs_select_authenticated" ON public.maintenance_logs
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: solo con su propio user_id
CREATE POLICY "logs_insert_own" ON public.maintenance_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: solo sus propios registros
CREATE POLICY "logs_update_own" ON public.maintenance_logs
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: solo sus propios registros
CREATE POLICY "logs_delete_own" ON public.maintenance_logs
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 4. POLÍTICAS PARA surgery_rounds
--    Mismo patrón que maintenance_logs.
-- ============================================================================

CREATE POLICY "rounds_select_authenticated" ON public.surgery_rounds
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "rounds_insert_own" ON public.surgery_rounds
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rounds_update_own" ON public.surgery_rounds
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rounds_delete_own" ON public.surgery_rounds
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 5. POLÍTICAS PARA correctivos_husj
--    Todos los autenticados pueden leer/modificar (tabla compartida).
-- ============================================================================

CREATE POLICY "correctivos_select_authenticated" ON public.correctivos_husj
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "correctivos_insert_authenticated" ON public.correctivos_husj
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "correctivos_update_authenticated" ON public.correctivos_husj
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "correctivos_delete_authenticated" ON public.correctivos_husj
  FOR DELETE TO authenticated
  USING (true);

-- ============================================================================
-- 6. POLÍTICAS PARA maintenance_plans
--    Solo lectura para usuarios estándar, modificación para todos autenticados.
-- ============================================================================

CREATE POLICY "plans_select_authenticated" ON public.maintenance_plans
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "plans_insert_authenticated" ON public.maintenance_plans
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "plans_update_authenticated" ON public.maintenance_plans
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "plans_delete_authenticated" ON public.maintenance_plans
  FOR DELETE TO authenticated
  USING (true);

-- ============================================================================
-- 7. VERIFICACIÓN — ejecutá estas queries para confirmar que RLS está activo
-- ============================================================================

-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('equipments', 'maintenance_logs', 'correctivos_husj', 'surgery_rounds', 'maintenance_plans');
--
-- SELECT tablename, policyname, cmd, qual FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;

-- ============================================================================
-- OPCIONAL: AGREGAR COLUMNA user_id si no existe
-- ============================================================================
-- Si maintenance_logs o surgery_rounds NO tienen columna user_id, ejecutar:

-- ALTER TABLE public.maintenance_logs ADD COLUMN user_id uuid REFERENCES auth.users(id);
-- ALTER TABLE public.surgery_rounds ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Para migrar datos existentes (asignar a un admin genérico):

-- UPDATE public.maintenance_logs SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
-- UPDATE public.surgery_rounds SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Luego hacer NOT NULL:
-- ALTER TABLE public.maintenance_logs ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE public.surgery_rounds ALTER COLUMN user_id SET NOT NULL;

-- ============================================================================
-- PRÓXIMO PASO RECOMENDADO: RBAC con roles
-- ============================================================================
-- Crear tabla de perfiles y asignar roles (admin, tecnico):
--
-- CREATE TABLE public.profiles (
--   id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   email text,
--   role text DEFAULT 'tecnico' CHECK (role IN ('admin', 'tecnico')),
--   created_at timestamptz DEFAULT now()
-- );
--
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "profiles_select_own" ON public.profiles
--   FOR SELECT TO authenticated USING (id = auth.uid());
--
-- Luego modificar las políticas de DELETE/UPDATE en equipments para requerir role = 'admin'.
