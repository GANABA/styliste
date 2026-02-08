# Schéma de Base de Données - Styliste.com

Date : 2026-02-05

---

## Architecture Générale

- Base de données relationnelle (PostgreSQL recommandé)
- Multi-tenant : isolation par `stylist_id`
- Backup automatique quotidien
- Soft delete (deleted_at) pour la plupart des tables

---

## Conventions

- **PK** : Primary Key
- **FK** : Foreign Key
- **UK** : Unique Key
- **IDX** : Index
- Tous les IDs : UUID v4
- Timestamps : UTC
- Soft delete : `deleted_at` nullable timestamp

---

## Tables Principales

### 1. users (Utilisateurs système)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('stylist', 'admin', 'super_admin', 'support') NOT NULL,
  email_verified_at TIMESTAMP,
  phone_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  locale VARCHAR(5) DEFAULT 'fr', -- fr, en
  timezone VARCHAR(50) DEFAULT 'Africa/Porto-Novo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

---

### 2. stylists (Profils des stylistes)
```sql
CREATE TABLE stylists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Informations de base
  business_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  slug VARCHAR(255) UNIQUE NOT NULL, -- URL du portfolio
  bio TEXT,
  avatar_url VARCHAR(500),
  cover_photo_url VARCHAR(500),

  -- Contact
  whatsapp_number VARCHAR(20),
  secondary_phone VARCHAR(20),
  website_url VARCHAR(500),

  -- Localisation
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100), -- Quartier
  country VARCHAR(2) DEFAULT 'BJ', -- ISO code
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Professionnel
  specialties JSONB DEFAULT '[]', -- ["mariage", "traditionnel", "moderne", "enfants"]
  years_of_experience INTEGER,
  certifications JSONB DEFAULT '[]',

  -- Paramètres
  max_concurrent_orders INTEGER DEFAULT 15,
  accepts_new_orders BOOLEAN DEFAULT TRUE,
  average_order_duration_days INTEGER, -- Calculé automatiquement
  price_range ENUM('low', 'medium', 'high', 'luxury'),

  -- Notifications
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "whatsapp": false}',
  sms_credits INTEGER DEFAULT 0,

  -- Mesures
  measurement_unit ENUM('cm', 'inches') DEFAULT 'cm',
  custom_measurement_templates JSONB DEFAULT '[]',

  -- Statistiques (dénormalisées pour performance)
  total_orders_completed INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  portfolio_views_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2), -- Pour V1 si avis

  -- Statut
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step VARCHAR(50), -- "profile", "first_client", "first_order", "completed"
  is_featured BOOLEAN DEFAULT FALSE, -- Mis en avant dans annuaire
  is_verified BOOLEAN DEFAULT FALSE, -- Badge vérifié

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_stylists_user_id ON stylists(user_id);
CREATE INDEX idx_stylists_slug ON stylists(slug);
CREATE INDEX idx_stylists_city ON stylists(city);
CREATE INDEX idx_stylists_country ON stylists(country);
CREATE INDEX idx_stylists_specialties ON stylists USING GIN(specialties);
CREATE INDEX idx_stylists_location ON stylists(latitude, longitude);
CREATE INDEX idx_stylists_accepts_orders ON stylists(accepts_new_orders);
```

---

### 3. subscription_plans (Plans d'abonnement)
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  name VARCHAR(100) NOT NULL, -- "Découverte", "Standard", "Pro", "Premium"
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,

  -- Tarification
  price_monthly INTEGER NOT NULL, -- En centimes (FCFA)
  price_yearly INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF', -- Franc CFA

  -- Limites
  max_clients INTEGER, -- NULL = illimité
  max_active_orders INTEGER,
  max_portfolio_photos INTEGER, -- 0 = pas de portfolio
  sms_credits_included INTEGER DEFAULT 0,
  email_credits_included INTEGER, -- NULL = illimité

  -- Fonctionnalités
  features JSONB NOT NULL DEFAULT '{}',
  /* Exemple:
  {
    "portfolio_public": false,
    "auto_notifications": true,
    "advanced_stats": false,
    "multi_employees": false,
    "ai_features": false,
    "priority_support": false,
    "export_data": true,
    "custom_domain": false
  }
  */

  -- Affichage
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE, -- Badge "Populaire"

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_plans_active ON subscription_plans(is_active);

-- Données initiales
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, max_clients, max_active_orders, max_portfolio_photos, features, display_order) VALUES
('Découverte', 'free', 0, 0, 20, 5, 0, '{"portfolio_public": false, "auto_notifications": false}', 1),
('Standard', 'standard', 500000, 5000000, 100, 15, 0, '{"portfolio_public": false, "auto_notifications": true}', 2),
('Pro', 'pro', 1000000, 10000000, NULL, 20, 50, '{"portfolio_public": true, "auto_notifications": true, "advanced_stats": true}', 3),
('Premium', 'premium', 2000000, 20000000, NULL, NULL, 200, '{"portfolio_public": true, "auto_notifications": true, "advanced_stats": true, "multi_employees": true, "ai_features": true, "priority_support": true}', 4);
```

---

### 4. subscriptions (Abonnements actifs)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),

  -- Période
  billing_cycle ENUM('monthly', 'yearly') NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  trial_end TIMESTAMP, -- Fin de la période d'essai
  canceled_at TIMESTAMP, -- Si annulé, prend effet à current_period_end
  ended_at TIMESTAMP, -- Fin réelle

  -- Paiement
  status ENUM('trial', 'active', 'past_due', 'canceled', 'suspended') NOT NULL DEFAULT 'trial',
  last_payment_date TIMESTAMP,
  next_payment_date TIMESTAMP,
  payment_method ENUM('mobile_money', 'card', 'bank_transfer', 'cash') DEFAULT 'mobile_money',

  -- Crédits
  sms_credits_remaining INTEGER DEFAULT 0,
  sms_credits_used INTEGER DEFAULT 0,

  -- Downgrade prévu
  scheduled_plan_change JSONB, -- {target_plan_id, effective_date}

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_stylist ON subscriptions(stylist_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(current_period_end);
CREATE UNIQUE INDEX idx_subscriptions_active ON subscriptions(stylist_id) WHERE ended_at IS NULL;
```

---

### 5. clients (Clients des stylistes)
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,

  -- Informations personnelles
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  full_name VARCHAR(255) GENERATED ALWAYS AS (first_name || ' ' || COALESCE(last_name, '')) STORED,
  phone VARCHAR(20) NOT NULL,
  secondary_phone VARCHAR(20),
  email VARCHAR(255),
  whatsapp_number VARCHAR(20),

  -- Préférences
  preferred_contact_method ENUM('phone', 'whatsapp', 'sms', 'email') DEFAULT 'phone',
  notification_opt_in BOOLEAN DEFAULT TRUE,

  -- Profil
  gender ENUM('male', 'female', 'other'),
  date_of_birth DATE,
  notes TEXT,
  tags JSONB DEFAULT '[]', -- ["vip", "fidèle", "difficile"]

  -- Statistiques
  total_orders INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0, -- En centimes
  last_order_date TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_clients_stylist ON clients(stylist_id);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_full_name ON clients(full_name);
CREATE INDEX idx_clients_tags ON clients USING GIN(tags);
CREATE UNIQUE INDEX idx_clients_stylist_phone ON clients(stylist_id, phone) WHERE deleted_at IS NULL;
```

---

### 6. measurement_templates (Templates de mesures)
```sql
CREATE TABLE measurement_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE, -- NULL = template système

  -- Identification
  name VARCHAR(100) NOT NULL, -- "Robe femme", "Costume homme"
  category VARCHAR(50), -- "femme", "homme", "enfant"
  garment_type VARCHAR(50), -- "robe", "pantalon", "costume"
  is_system_template BOOLEAN DEFAULT FALSE,

  -- Mesures
  measurements JSONB NOT NULL,
  /* Exemple:
  [
    {
      "key": "tour_poitrine",
      "label": "Tour de poitrine",
      "unit": "cm",
      "required": true,
      "order": 1
    },
    {
      "key": "tour_taille",
      "label": "Tour de taille",
      "unit": "cm",
      "required": true,
      "order": 2
    }
  ]
  */

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_measurement_templates_stylist ON measurement_templates(stylist_id);
CREATE INDEX idx_measurement_templates_category ON measurement_templates(category);
```

---

### 7. client_measurements (Mesures clients versionnées)
```sql
CREATE TABLE client_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template_id UUID REFERENCES measurement_templates(id) ON DELETE SET NULL,

  -- Données
  template_name VARCHAR(100) NOT NULL, -- Dénormalisé au cas où template supprimé
  measurements JSONB NOT NULL,
  /* Exemple:
  {
    "tour_poitrine": 95,
    "tour_taille": 75,
    "tour_hanches": 100,
    "longueur_robe": 110
  }
  */

  -- Versioning
  date_taken DATE NOT NULL,
  is_current BOOLEAN DEFAULT TRUE, -- Une seule version current par template
  notes TEXT,
  taken_by_employee_id UUID REFERENCES employees(id), -- Si multi-employés

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_measurements_client ON client_measurements(client_id);
CREATE INDEX idx_measurements_current ON client_measurements(is_current);
CREATE INDEX idx_measurements_date ON client_measurements(date_taken);
```

---

### 8. orders (Commandes)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  order_number VARCHAR(50) UNIQUE NOT NULL, -- Format: ORD-2025-0001

  -- Type et description
  garment_type VARCHAR(100) NOT NULL, -- "Robe de soirée", "Costume 3 pièces"
  description TEXT,
  special_requests TEXT,

  -- Statut
  status ENUM('quote', 'in_progress', 'ready', 'delivered', 'canceled') NOT NULL DEFAULT 'quote',
  sub_status VARCHAR(50), -- "cutting", "assembly", "fitting", "alterations"
  cancellation_reason TEXT,
  canceled_at TIMESTAMP,

  -- Dates
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  promised_date DATE NOT NULL, -- Date promise au client
  actual_delivery_date DATE,
  urgency_level ENUM('normal', 'high', 'urgent') DEFAULT 'normal',

  -- Tissu
  fabric_provided_by ENUM('client', 'stylist') NOT NULL,
  fabric_received_date DATE, -- Si fourni par client
  fabric_description TEXT,
  fabric_supplier_id UUID REFERENCES fabric_suppliers(id), -- Si fourni par styliste

  -- Prix
  total_price INTEGER NOT NULL, -- En centimes (FCFA)
  urgency_surcharge INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  final_price INTEGER GENERATED ALWAYS AS (total_price + urgency_surcharge - discount_amount) STORED,

  -- Paiement
  advance_amount INTEGER DEFAULT 0, -- Avance versée
  total_paid INTEGER DEFAULT 0, -- Total payé (peut inclure paiements intermédiaires)
  balance_due INTEGER GENERATED ALWAYS AS (total_price + urgency_surcharge - discount_amount - total_paid) STORED,
  payment_status ENUM('unpaid', 'partial', 'paid', 'refunded') DEFAULT 'unpaid',

  -- Items multiples (pour ensembles)
  is_multi_item BOOLEAN DEFAULT FALSE,
  items JSONB DEFAULT '[]',
  /* Exemple pour ensemble 3 pièces:
  [
    {"item": "Veste", "price": 15000, "status": "in_progress"},
    {"item": "Pantalon", "price": 10000, "status": "in_progress"},
    {"item": "Gilet", "price": 8000, "status": "ready"}
  ]
  */

  -- Mesures utilisées (snapshot)
  measurements_snapshot JSONB,

  -- Assignation (multi-employés)
  assigned_to_employee_id UUID REFERENCES employees(id),

  -- Notifications
  last_notification_sent_at TIMESTAMP,
  notification_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_orders_stylist ON orders(stylist_id);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_promised_date ON orders(promised_date);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_assigned_to ON orders(assigned_to_employee_id);

-- Trigger pour auto-incrémenter order_number par styliste
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
  year_str VARCHAR(4);
BEGIN
  year_str := TO_CHAR(NEW.order_date, 'YYYY');

  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '\d{4}$') AS INTEGER)), 0) + 1
  INTO next_num
  FROM orders
  WHERE stylist_id = NEW.stylist_id
    AND SUBSTRING(order_number FROM 'ORD-\d{4}') = 'ORD-' || year_str;

  NEW.order_number := 'ORD-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_order_number
BEFORE INSERT ON orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL)
EXECUTE FUNCTION generate_order_number();
```

---

### 9. order_photos (Photos liées aux commandes)
```sql
CREATE TABLE order_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Photo
  photo_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  photo_type ENUM('reference', 'fabric', 'fitting', 'finished') NOT NULL,

  -- Métadonnées
  caption TEXT,
  upload_date TIMESTAMP DEFAULT NOW(),
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_photos_order ON order_photos(order_id);
CREATE INDEX idx_order_photos_type ON order_photos(photo_type);
```

---

### 10. order_history (Historique des modifications de commandes)
```sql
CREATE TABLE order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Modification
  changed_by_user_id UUID REFERENCES users(id),
  change_type ENUM('status_change', 'price_change', 'date_change', 'description_change', 'other') NOT NULL,
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  comment TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_history_order ON order_history(order_id);
CREATE INDEX idx_order_history_type ON order_history(change_type);
CREATE INDEX idx_order_history_date ON order_history(created_at);
```

---

### 11. payments (Paiements)
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,

  -- Montant
  amount INTEGER NOT NULL, -- En centimes
  payment_type ENUM('advance', 'partial', 'final', 'refund') NOT NULL,

  -- Méthode
  payment_method ENUM('cash', 'mobile_money', 'bank_transfer', 'card', 'other') NOT NULL,
  mobile_money_provider VARCHAR(50), -- "MTN", "Moov", "Orange"
  mobile_money_number VARCHAR(20),
  transaction_reference VARCHAR(255),

  -- Statut
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Notes
  notes TEXT,
  receipt_url VARCHAR(500), -- URL du reçu PDF généré

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_stylist ON payments(stylist_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_method ON payments(payment_method);
```

---

### 12. notifications (Historique des notifications)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Contenu
  notification_type ENUM('order_ready', 'payment_reminder', 'pickup_reminder', 'fitting_reminder', 'custom') NOT NULL,
  channel ENUM('sms', 'email', 'whatsapp') NOT NULL,
  recipient VARCHAR(255) NOT NULL, -- Phone ou email
  subject VARCHAR(255),
  message TEXT NOT NULL,

  -- Statut
  status ENUM('pending', 'sent', 'delivered', 'failed', 'read') DEFAULT 'pending',
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP, -- Pour WhatsApp uniquement
  error_message TEXT,

  -- Coût
  cost_credits INTEGER DEFAULT 0, -- Nombre de crédits consommés

  -- Template utilisé
  template_id UUID REFERENCES notification_templates(id),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_stylist ON notifications(stylist_id);
CREATE INDEX idx_notifications_client ON notifications(client_id);
CREATE INDEX idx_notifications_order ON notifications(order_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_date ON notifications(created_at);
```

---

### 13. notification_templates (Templates de messages)
```sql
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE, -- NULL = template système

  -- Identification
  name VARCHAR(100) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  is_system_template BOOLEAN DEFAULT FALSE,

  -- Contenu
  subject_template VARCHAR(255), -- Pour email
  message_template TEXT NOT NULL,
  /* Variables supportées:
     {client_name}, {order_number}, {garment_type}, {promised_date},
     {price}, {balance_due}, {business_name}, {phone}, {address}
  */

  -- Canaux
  supported_channels JSONB DEFAULT '["sms", "email", "whatsapp"]',

  -- Statut
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notification_templates_stylist ON notification_templates(stylist_id);
CREATE INDEX idx_notification_templates_type ON notification_templates(notification_type);
```

---

### 14. portfolio_items (Éléments du portfolio)
```sql
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,

  -- Photo
  photo_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),

  -- Métadonnées
  title VARCHAR(255),
  description TEXT,
  tags JSONB DEFAULT '[]', -- ["mariage", "robe", "traditionnel"]
  category VARCHAR(50), -- "femme", "homme", "enfant"
  garment_type VARCHAR(100),

  -- Lié à une commande ?
  source_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Consentement client
  client_consent_given BOOLEAN DEFAULT FALSE,
  client_consent_date TIMESTAMP,
  face_blurred BOOLEAN DEFAULT FALSE,

  -- Prix (optionnel)
  estimated_price_min INTEGER,
  estimated_price_max INTEGER,

  -- Statistiques
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0, -- Pour V2
  shares_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0, -- Nombre de fois "Commander ce modèle" cliqué

  -- Affichage
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE, -- Épinglé en haut
  is_public BOOLEAN DEFAULT TRUE,

  -- Modération
  moderation_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  moderated_at TIMESTAMP,
  moderation_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_portfolio_stylist ON portfolio_items(stylist_id);
CREATE INDEX idx_portfolio_tags ON portfolio_items USING GIN(tags);
CREATE INDEX idx_portfolio_category ON portfolio_items(category);
CREATE INDEX idx_portfolio_featured ON portfolio_items(is_featured);
CREATE INDEX idx_portfolio_public ON portfolio_items(is_public);
CREATE INDEX idx_portfolio_moderation ON portfolio_items(moderation_status);
```

---

### 15. appointments (Rendez-vous / Essayages)
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- Rendez-vous
  appointment_type ENUM('fitting', 'consultation', 'pickup', 'measurement', 'other') NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,

  -- Statut
  status ENUM('scheduled', 'confirmed', 'completed', 'canceled', 'no_show') DEFAULT 'scheduled',

  -- Notes
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_appointments_stylist ON appointments(stylist_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_order ON appointments(order_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
```

---

### 16. employees (Employés - Multi-employés V1)
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL, -- NULL si pas de compte

  -- Informations
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),

  -- Rôle
  role ENUM('owner', 'tailor', 'secretary', 'accountant') NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  /* Exemple:
  {
    "view_clients": true,
    "edit_clients": true,
    "view_orders": true,
    "edit_orders": true,
    "view_payments": true,
    "manage_payments": false,
    "send_notifications": true,
    "view_stats": false
  }
  */

  -- Statut
  is_active BOOLEAN DEFAULT TRUE,
  hired_date DATE,
  terminated_date DATE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_employees_stylist ON employees(stylist_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_active ON employees(is_active);
```

---

### 17. fabric_suppliers (Fournisseurs de tissu - V1/V2)
```sql
CREATE TABLE fabric_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE, -- NULL = fournisseur système

  -- Informations
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,

  -- Notes
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Statut
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fabric_suppliers_stylist ON fabric_suppliers(stylist_id);
CREATE INDEX idx_fabric_suppliers_active ON fabric_suppliers(is_active);
```

---

### 18. fabric_inventory (Stock de tissu - V2)
```sql
CREATE TABLE fabric_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES fabric_suppliers(id) ON DELETE SET NULL,

  -- Tissu
  fabric_name VARCHAR(255) NOT NULL,
  fabric_type VARCHAR(100), -- "Coton", "Soie", "Wax", "Dentelle"
  color VARCHAR(100),
  pattern VARCHAR(100),

  -- Stock
  quantity_meters DECIMAL(10, 2) NOT NULL,
  quantity_reserved DECIMAL(10, 2) DEFAULT 0,
  quantity_available DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_meters - quantity_reserved) STORED,
  unit_price INTEGER, -- Prix au mètre en centimes

  -- Localisation
  storage_location VARCHAR(255),

  -- Dates
  purchase_date DATE,
  expiry_date DATE, -- Si applicable

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fabric_inventory_stylist ON fabric_inventory(stylist_id);
CREATE INDEX idx_fabric_inventory_supplier ON fabric_inventory(supplier_id);
```

---

### 19. stylist_schedule (Calendrier styliste - Congés)
```sql
CREATE TABLE stylist_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,

  -- Période
  event_type ENUM('vacation', 'closure', 'busy', 'available') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Description
  title VARCHAR(255),
  description TEXT,

  -- Impact
  affects_orders BOOLEAN DEFAULT TRUE, -- Si TRUE, report automatique des commandes

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_schedule_stylist ON stylist_schedule(stylist_id);
CREATE INDEX idx_schedule_dates ON stylist_schedule(start_date, end_date);
```

---

### 20. referrals (Parrainages)
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parrain
  referrer_stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) UNIQUE NOT NULL, -- "STYLE-JEAN-2025"

  -- Filleul
  referred_stylist_id UUID REFERENCES stylists(id) ON DELETE SET NULL,
  referred_email VARCHAR(255),
  referred_phone VARCHAR(20),

  -- Statut
  status ENUM('pending', 'signed_up', 'converted', 'expired', 'canceled') DEFAULT 'pending',
  signup_date TIMESTAMP,
  conversion_date TIMESTAMP, -- Passage au plan payant

  -- Récompenses
  reward_granted BOOLEAN DEFAULT FALSE,
  reward_type VARCHAR(50), -- "1_month_free", "discount_50_percent"
  reward_granted_at TIMESTAMP,

  -- Suivi
  referred_subscription_months INTEGER DEFAULT 0, -- Mois payés par le filleul
  min_months_required INTEGER DEFAULT 2, -- Minimum pour valider

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_stylist_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_stylist_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);
```

---

### 21. admin_audit_logs (Logs admin - Dashboard administrateur)
```sql
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES users(id),

  -- Action
  action_type VARCHAR(100) NOT NULL, -- "suspend_stylist", "change_plan", "refund"
  entity_type VARCHAR(50), -- "stylist", "order", "subscription"
  entity_id UUID,

  -- Détails
  description TEXT,
  before_data JSONB,
  after_data JSONB,
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_admin ON admin_audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_date ON admin_audit_logs(created_at);
```

---

### 22. platform_statistics (Statistiques globales - Cache)
```sql
CREATE TABLE platform_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Date
  date DATE UNIQUE NOT NULL,

  -- Métriques
  total_stylists INTEGER DEFAULT 0,
  active_stylists INTEGER DEFAULT 0, -- Connectés dans les 30 derniers jours
  new_stylists_today INTEGER DEFAULT 0,

  total_subscriptions INTEGER DEFAULT 0,
  subscriptions_by_plan JSONB DEFAULT '{}', -- {"free": 100, "standard": 50, "pro": 20}

  total_orders INTEGER DEFAULT 0,
  orders_created_today INTEGER DEFAULT 0,

  total_revenue INTEGER DEFAULT 0, -- En centimes
  revenue_today INTEGER DEFAULT 0,

  -- Engagement
  total_clients INTEGER DEFAULT 0,
  total_notifications_sent INTEGER DEFAULT 0,
  total_portfolio_views INTEGER DEFAULT 0,

  -- Conversion
  trial_to_paid_conversion_rate DECIMAL(5, 2),
  churn_rate DECIMAL(5, 2),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_platform_stats_date ON platform_statistics(date);
```

---

## Vues Matérialisées (pour performance)

### Vue: active_subscriptions
```sql
CREATE MATERIALIZED VIEW active_subscriptions_summary AS
SELECT
  s.id as stylist_id,
  s.business_name,
  sp.name as plan_name,
  sub.status,
  sub.current_period_end,
  sub.sms_credits_remaining,
  sp.max_clients,
  sp.max_active_orders,
  COUNT(DISTINCT c.id) as current_clients_count,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('in_progress', 'ready')) as current_active_orders_count
FROM stylists s
JOIN subscriptions sub ON s.id = sub.stylist_id
JOIN subscription_plans sp ON sub.plan_id = sp.id
LEFT JOIN clients c ON s.id = c.stylist_id AND c.deleted_at IS NULL
LEFT JOIN orders o ON s.id = o.stylist_id AND o.deleted_at IS NULL
WHERE sub.ended_at IS NULL
GROUP BY s.id, s.business_name, sp.name, sub.status, sub.current_period_end, sub.sms_credits_remaining, sp.max_clients, sp.max_active_orders;

CREATE UNIQUE INDEX ON active_subscriptions_summary (stylist_id);
REFRESH MATERIALIZED VIEW CONCURRENTLY active_subscriptions_summary;
```

---

## Triggers et Fonctions Utiles

### Mise à jour automatique de updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer à toutes les tables concernées
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stylists_updated_at BEFORE UPDATE ON stylists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... etc pour autres tables
```

### Mise à jour des statistiques client
```sql
CREATE OR REPLACE FUNCTION update_client_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE clients
    SET
      total_orders = (SELECT COUNT(*) FROM orders WHERE client_id = NEW.client_id AND deleted_at IS NULL),
      total_spent = (SELECT COALESCE(SUM(final_price), 0) FROM orders WHERE client_id = NEW.client_id AND payment_status = 'paid' AND deleted_at IS NULL),
      last_order_date = (SELECT MAX(order_date) FROM orders WHERE client_id = NEW.client_id AND deleted_at IS NULL)
    WHERE id = NEW.client_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_client_statistics
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_client_statistics();
```

### Mise à jour automatique du solde de commande
```sql
CREATE OR REPLACE FUNCTION update_order_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET
    total_paid = (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE order_id = NEW.order_id AND payment_status = 'completed'),
    payment_status = CASE
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE order_id = NEW.order_id AND payment_status = 'completed') = 0 THEN 'unpaid'
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE order_id = NEW.order_id AND payment_status = 'completed') >= (SELECT final_price FROM orders WHERE id = NEW.order_id) THEN 'paid'
      ELSE 'partial'
    END
  WHERE id = NEW.order_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_order_paid_amount
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_order_paid_amount();
```

---

## Sécurité

### Row Level Security (RLS)

```sql
-- Activer RLS sur les tables principales
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Politique: Un styliste ne voit que ses propres données
CREATE POLICY stylist_clients_policy ON clients
  FOR ALL
  USING (stylist_id = current_setting('app.current_stylist_id')::UUID);

CREATE POLICY stylist_orders_policy ON orders
  FOR ALL
  USING (stylist_id = current_setting('app.current_stylist_id')::UUID);

-- Les admins voient tout
CREATE POLICY admin_full_access_clients ON clients
  FOR ALL
  TO admin_role
  USING (true);
```

---

## Indexes Additionnels pour Performance

```sql
-- Full-text search sur clients
CREATE INDEX idx_clients_fulltext ON clients USING GIN(to_tsvector('french', full_name || ' ' || COALESCE(phone, '')));

-- Recherche portfolio
CREATE INDEX idx_portfolio_fulltext ON portfolio_items USING GIN(to_tsvector('french', title || ' ' || COALESCE(description, '')));

-- Recherche stylistes
CREATE INDEX idx_stylists_fulltext ON stylists USING GIN(to_tsvector('french', business_name || ' ' || COALESCE(bio, '')));
```

---

## Séquences et Compteurs

```sql
-- Compteur de commandes par styliste (géré par trigger)
CREATE SEQUENCE order_counter_seq;

-- Compteur de factures
CREATE SEQUENCE invoice_counter_seq;
```

---

## Données de Référence (Seeds)

### Templates de mesures système
```sql
INSERT INTO measurement_templates (name, category, garment_type, is_system_template, measurements) VALUES
('Robe Femme - Standard', 'femme', 'robe', true, '[
  {"key": "tour_poitrine", "label": "Tour de poitrine", "unit": "cm", "required": true, "order": 1},
  {"key": "tour_taille", "label": "Tour de taille", "unit": "cm", "required": true, "order": 2},
  {"key": "tour_hanches", "label": "Tour de hanches", "unit": "cm", "required": true, "order": 3},
  {"key": "longueur_robe", "label": "Longueur robe", "unit": "cm", "required": false, "order": 4},
  {"key": "longueur_manches", "label": "Longueur manches", "unit": "cm", "required": false, "order": 5},
  {"key": "tour_bras", "label": "Tour de bras", "unit": "cm", "required": false, "order": 6},
  {"key": "largeur_epaules", "label": "Largeur épaules", "unit": "cm", "required": false, "order": 7}
]'),
('Costume Homme - Standard', 'homme', 'costume', true, '[
  {"key": "tour_poitrine", "label": "Tour de poitrine", "unit": "cm", "required": true, "order": 1},
  {"key": "tour_taille", "label": "Tour de taille", "unit": "cm", "required": true, "order": 2},
  {"key": "longueur_dos", "label": "Longueur dos", "unit": "cm", "required": true, "order": 3},
  {"key": "longueur_manches", "label": "Longueur manches", "unit": "cm", "required": true, "order": 4},
  {"key": "largeur_epaules", "label": "Largeur épaules", "unit": "cm", "required": false, "order": 5},
  {"key": "tour_cou", "label": "Tour de cou", "unit": "cm", "required": false, "order": 6},
  {"key": "longueur_pantalon", "label": "Longueur pantalon", "unit": "cm", "required": true, "order": 7}
]');
```

### Templates de notifications système
```sql
INSERT INTO notification_templates (name, notification_type, is_system_template, message_template) VALUES
('Commande prête', 'order_ready', true, 'Bonjour {client_name}, votre {garment_type} (commande {order_number}) est prête ! Vous pouvez venir la récupérer. {business_name} - {phone}'),
('Rappel de paiement', 'payment_reminder', true, 'Bonjour {client_name}, rappel : il reste {balance_due} FCFA à régler pour votre commande {order_number}. Merci ! {business_name}'),
('Rappel de récupération', 'pickup_reminder', true, 'Bonjour {client_name}, votre {garment_type} vous attend depuis le {promised_date}. Passez le récupérer. {business_name} - {phone}');
```

---

## Migrations

### Script de migration v1 → v2 (exemple)
```sql
-- Ajout de nouvelles colonnes
ALTER TABLE stylists ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS urgency_level ENUM('normal', 'high', 'urgent') DEFAULT 'normal';

-- Migration de données existantes
UPDATE orders SET urgency_level = 'normal' WHERE urgency_level IS NULL;
```

---

## Monitoring et Performance

### Requêtes les plus utiles pour le dashboard

```sql
-- Statistiques styliste (utilisé sur son dashboard)
SELECT
  COUNT(DISTINCT c.id) as total_clients,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('in_progress', 'ready')) as active_orders,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'delivered') as completed_orders,
  COALESCE(SUM(p.amount) FILTER (WHERE p.payment_date >= CURRENT_DATE - INTERVAL '30 days'), 0) as revenue_last_30_days,
  COUNT(DISTINCT o.id) FILTER (WHERE o.promised_date < CURRENT_DATE AND o.status != 'delivered') as overdue_orders
FROM stylists s
LEFT JOIN clients c ON s.id = c.stylist_id AND c.deleted_at IS NULL
LEFT JOIN orders o ON s.id = o.stylist_id AND o.deleted_at IS NULL
LEFT JOIN payments p ON o.id = p.order_id AND p.payment_status = 'completed'
WHERE s.id = :stylist_id;

-- Commandes à surveiller (prochaines livraisons)
SELECT
  o.id,
  o.order_number,
  c.full_name as client_name,
  o.garment_type,
  o.promised_date,
  o.status,
  o.balance_due
FROM orders o
JOIN clients c ON o.client_id = c.id
WHERE o.stylist_id = :stylist_id
  AND o.status IN ('in_progress', 'ready')
  AND o.promised_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND o.deleted_at IS NULL
ORDER BY o.promised_date ASC;
```

---

## Backup et Restauration

```bash
# Backup quotidien automatisé
pg_dump -h localhost -U styliste_user -d styliste_db -F c -f backup_$(date +%Y%m%d).dump

# Restauration
pg_restore -h localhost -U styliste_user -d styliste_db backup_20250205.dump
```

---

**Version**: 1.0
**Dernière mise à jour**: 2026-02-05
**SGBD**: PostgreSQL 14+
