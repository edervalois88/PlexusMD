-- Habilitar Row Level Security en las tablas
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;

-- Función para obtener el organization_id del JWT actual
-- Se asume que el token JWT contiene el claim 'app_metadata.organization_id' o 'user_metadata.organization_id'
CREATE OR REPLACE FUNCTION current_organization_id()
RETURNS text AS $$
  SELECT current_setting('request.jwt.claims', true)::json->'app_metadata'->>'organization_id';
$$ LANGUAGE sql STABLE;

-- Políticas para 'Organization'
-- Los usuarios solo pueden ver la organización a la que pertenecen
CREATE POLICY "Users can view their own organization"
ON "Organization"
FOR SELECT
USING (id::text = current_organization_id());

-- Políticas para 'User'
-- Los usuarios solo pueden ver a otros usuarios en su misma organización
CREATE POLICY "Users can view users in same organization"
ON "User"
FOR SELECT
USING (organization_id::text = current_organization_id());

-- Políticas para 'Patient'
-- Todas las operaciones sobre pacientes están restringidas a la organización del usuario
CREATE POLICY "Users can view patients in their organization"
ON "Patient"
FOR SELECT
USING (organization_id::text = current_organization_id());

CREATE POLICY "Users can insert patients in their organization"
ON "Patient"
FOR INSERT
WITH CHECK (organization_id::text = current_organization_id());

CREATE POLICY "Users can update patients in their organization"
ON "Patient"
FOR UPDATE
USING (organization_id::text = current_organization_id());

CREATE POLICY "Users can delete patients in their organization"
ON "Patient"
FOR DELETE
USING (organization_id::text = current_organization_id());

-- Políticas para 'Appointment'
-- Todas las operaciones sobre citas están restringidas a la organización del usuario
CREATE POLICY "Users can view appointments in their organization"
ON "Appointment"
FOR SELECT
USING (organization_id::text = current_organization_id());

CREATE POLICY "Users can insert appointments in their organization"
ON "Appointment"
FOR INSERT
WITH CHECK (organization_id::text = current_organization_id());

CREATE POLICY "Users can update appointments in their organization"
ON "Appointment"
FOR UPDATE
USING (organization_id::text = current_organization_id());

CREATE POLICY "Users can delete appointments in their organization"
ON "Appointment"
FOR DELETE
USING (organization_id::text = current_organization_id());
