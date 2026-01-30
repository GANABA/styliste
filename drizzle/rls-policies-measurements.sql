-- RLS Policies for measurements table
-- Ces policies garantissent l'isolation multi-tenant : chaque styliste ne peut accéder qu'aux mesures de ses propres clients

-- Policy SELECT: Stylistes peuvent voir uniquement les mesures de leurs clients
CREATE POLICY "Stylistes can view their own measurements"
ON measurements
FOR SELECT
USING (
  styliste_id IN (
    SELECT id FROM stylistes WHERE user_id = auth.uid()
  )
);

-- Policy INSERT: Stylistes peuvent créer des mesures uniquement pour leurs clients
CREATE POLICY "Stylistes can insert their own measurements"
ON measurements
FOR INSERT
WITH CHECK (
  styliste_id IN (
    SELECT id FROM stylistes WHERE user_id = auth.uid()
  )
  AND
  client_id IN (
    SELECT id FROM clients WHERE styliste_id IN (
      SELECT id FROM stylistes WHERE user_id = auth.uid()
    )
  )
);

-- Policy UPDATE: Stylistes peuvent modifier uniquement leurs propres mesures
CREATE POLICY "Stylistes can update their own measurements"
ON measurements
FOR UPDATE
USING (
  styliste_id IN (
    SELECT id FROM stylistes WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  styliste_id IN (
    SELECT id FROM stylistes WHERE user_id = auth.uid()
  )
);

-- Policy DELETE: Stylistes peuvent supprimer uniquement leurs propres mesures
CREATE POLICY "Stylistes can delete their own measurements"
ON measurements
FOR DELETE
USING (
  styliste_id IN (
    SELECT id FROM stylistes WHERE user_id = auth.uid()
  )
);
