-- RLS Policies pour la table stylistes
-- Permet à un styliste de voir et modifier uniquement son propre profil

-- Policy: Styliste peut voir son propre profil
CREATE POLICY "Styliste can view own profile"
ON stylistes
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Styliste peut créer son propre profil
CREATE POLICY "Styliste can create own profile"
ON stylistes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Styliste peut mettre à jour son propre profil
CREATE POLICY "Styliste can update own profile"
ON stylistes
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Styliste peut supprimer son propre profil
CREATE POLICY "Styliste can delete own profile"
ON stylistes
FOR DELETE
USING (auth.uid() = user_id);
