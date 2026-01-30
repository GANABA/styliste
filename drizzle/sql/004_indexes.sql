-- Index de performance pour la table stylistes
CREATE INDEX IF NOT EXISTS idx_stylistes_user_id ON stylistes(user_id);

-- Index de performance pour la table clients
CREATE INDEX IF NOT EXISTS idx_clients_styliste_id ON clients(styliste_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
