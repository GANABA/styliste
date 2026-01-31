-- Indexes pour optimiser les performances des requêtes orders

-- Index pour filtrer par styliste et statut (excluant les supprimées)
CREATE INDEX IF NOT EXISTS idx_orders_styliste_status
  ON orders(styliste_id, status)
  WHERE deleted_at IS NULL;

-- Index pour récupérer les commandes d'un client
CREATE INDEX IF NOT EXISTS idx_orders_client
  ON orders(client_id)
  WHERE deleted_at IS NULL;

-- Index pour trier par date de création (plus récentes en premier)
CREATE INDEX IF NOT EXISTS idx_orders_created
  ON orders(created_at DESC)
  WHERE deleted_at IS NULL;

-- Index pour récupérer les commandes à livrer (due_date)
CREATE INDEX IF NOT EXISTS idx_orders_due_date
  ON orders(styliste_id, due_date)
  WHERE deleted_at IS NULL AND status != 'delivered';

-- Index pour assurer l'unicité des numéros de commande
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number
  ON orders(order_number);
