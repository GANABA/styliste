-- Index de performance pour la table measurements
-- Optimise les requêtes fréquentes : liste par client, liste par styliste, historique chronologique

-- Index pour filtrer les mesures par client (requête la plus fréquente)
CREATE INDEX IF NOT EXISTS idx_measurements_client_id ON measurements(client_id);

-- Index pour filtrer les mesures par styliste (pour RLS et isolation)
CREATE INDEX IF NOT EXISTS idx_measurements_styliste_id ON measurements(styliste_id);

-- Index pour trier l'historique des mesures par date de prise
CREATE INDEX IF NOT EXISTS idx_measurements_taken_at ON measurements(taken_at DESC);

-- Index composite pour la requête "dernières mesures d'un client"
-- Optimise : SELECT * FROM measurements WHERE client_id = ? ORDER BY taken_at DESC LIMIT 1
CREATE INDEX IF NOT EXISTS idx_measurements_client_taken ON measurements(client_id, taken_at DESC);

-- Index composite pour la requête "mesures d'un styliste triées par date"
-- Optimise : SELECT * FROM measurements WHERE styliste_id = ? ORDER BY taken_at DESC
CREATE INDEX IF NOT EXISTS idx_measurements_styliste_taken ON measurements(styliste_id, taken_at DESC);
