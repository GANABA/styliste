import { pgTable, uuid, text, timestamp, numeric, date, jsonb } from 'drizzle-orm/pg-core';

// Table stylistes - Profil professionnel du styliste
export const stylistes = pgTable('stylistes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // FK vers auth.users de Supabase
  salonName: text('salon_name').notNull(),
  description: text('description'),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  city: text('city'),
  country: text('country').default('BJ').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table clients - CRM local du styliste
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  stylisteId: uuid('styliste_id').notNull().references(() => stylistes.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table measurements - Mesures corporelles des clients
export const measurements = pgTable('measurements', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  stylisteId: uuid('styliste_id').notNull().references(() => stylistes.id, { onDelete: 'cascade' }),
  measurementType: text('measurement_type').notNull(), // ex: "tour_poitrine", "tour_taille"
  value: numeric('value', { precision: 10, scale: 2 }).notNull(), // valeur en cm
  unit: text('unit').default('cm').notNull(),
  notes: text('notes'),
  takenAt: timestamp('taken_at').defaultNow().notNull(), // date de prise de mesure
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table orders - Commandes de vêtements sur mesure
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  stylisteId: uuid('styliste_id').notNull().references(() => stylistes.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  orderNumber: text('order_number').notNull().unique(), // ex: "STY-202601-0042"
  garmentType: text('garment_type').notNull(), // ex: "Robe", "Costume", "Boubou"
  description: text('description'),
  measurementsSnapshot: jsonb('measurements_snapshot'), // snapshot des mesures au moment de la commande
  price: numeric('price', { precision: 10, scale: 2 }),
  currency: text('currency').default('XOF').notNull(),
  status: text('status').default('pending').notNull(), // pending | ready | delivered
  dueDate: date('due_date'),
  deliveredAt: timestamp('delivered_at'),
  notes: text('notes'),
  deletedAt: timestamp('deleted_at'), // soft delete
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
