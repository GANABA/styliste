import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

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
