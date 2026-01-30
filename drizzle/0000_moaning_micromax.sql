CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"styliste_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stylistes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"salon_name" text NOT NULL,
	"description" text,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"city" text,
	"country" text DEFAULT 'BJ' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stylistes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_styliste_id_stylistes_id_fk" FOREIGN KEY ("styliste_id") REFERENCES "public"."stylistes"("id") ON DELETE cascade ON UPDATE no action;