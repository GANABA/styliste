-- RLS Policies pour la table clients
-- Permet à un styliste de gérer uniquement ses propres clients

-- Policy: Styliste peut voir ses propres clients
CREATE POLICY "Styliste can view own clients"
ON clients
FOR SELECT
USING (
  styliste_id IN (
    SELECT id FROM stylistes WHERE user_id = auth.uid()
  )
);

-- Policy: Styliste peut créer des clients pour son profil
CREATE POLICY "Styliste can create own clients"
ON clients
FOR INSERT
WITH CHECK (
  styliste_id IN (
    SELECT id FROM stylistes WHERE user_id = auth.uid()
  )
);

-- Policy: Styliste peut mettre à jour ses propres clients
CREATE POLICY "Styliste can update own clients"
ON clients
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

-- Policy: Styliste peut supprimer ses propres clients
CREATE POLICY "Styliste can delete own clients"
ON clients
FOR DELETE
USING (
  styliste_id IN (
    SELECT id FROM stylistes WHERE user_id = auth.uid()
  )
);
