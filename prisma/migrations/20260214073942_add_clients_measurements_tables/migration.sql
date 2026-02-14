-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "stylist_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_templates" (
    "id" TEXT NOT NULL,
    "stylist_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "measurement_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_measurements" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "measurements" JSONB NOT NULL,
    "measured_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clients_stylist_id_idx" ON "clients"("stylist_id");

-- CreateIndex
CREATE INDEX "clients_name_idx" ON "clients"("name");

-- CreateIndex
CREATE INDEX "clients_phone_idx" ON "clients"("phone");

-- CreateIndex
CREATE INDEX "clients_stylist_id_deleted_at_idx" ON "clients"("stylist_id", "deleted_at");

-- CreateIndex
CREATE INDEX "measurement_templates_stylist_id_idx" ON "measurement_templates"("stylist_id");

-- CreateIndex
CREATE INDEX "client_measurements_client_id_idx" ON "client_measurements"("client_id");

-- CreateIndex
CREATE INDEX "client_measurements_template_id_idx" ON "client_measurements"("template_id");

-- CreateIndex
CREATE INDEX "client_measurements_client_id_measured_at_idx" ON "client_measurements"("client_id", "measured_at" DESC);

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "stylists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_templates" ADD CONSTRAINT "measurement_templates_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "stylists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_measurements" ADD CONSTRAINT "client_measurements_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_measurements" ADD CONSTRAINT "client_measurements_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "measurement_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
