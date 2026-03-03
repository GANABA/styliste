-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('QUOTE', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELED');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "FabricProvidedBy" AS ENUM ('CLIENT', 'STYLIST');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('REFERENCE', 'FABRIC', 'FITTING', 'FINISHED');

-- CreateEnum
CREATE TYPE "OrderChangeType" AS ENUM ('STATUS_CHANGE', 'PRICE_CHANGE', 'DATE_CHANGE', 'DESCRIPTION_CHANGE', 'OTHER');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "stylist_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "garment_type" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "special_requests" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'QUOTE',
    "cancellation_reason" TEXT,
    "canceled_at" TIMESTAMP(3),
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promised_date" TIMESTAMP(3) NOT NULL,
    "actual_delivery_date" TIMESTAMP(3),
    "urgency_level" "UrgencyLevel" NOT NULL DEFAULT 'NORMAL',
    "fabric_provided_by" "FabricProvidedBy" NOT NULL,
    "fabric_received_date" TIMESTAMP(3),
    "fabric_description" TEXT,
    "total_price" INTEGER NOT NULL,
    "advance_amount" INTEGER NOT NULL DEFAULT 0,
    "total_paid" INTEGER NOT NULL DEFAULT 0,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "measurements_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_photos" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "photo_type" "PhotoType" NOT NULL,
    "caption" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_history" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "changed_by_user_id" TEXT,
    "change_type" "OrderChangeType" NOT NULL,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_stylist_id_idx" ON "orders"("stylist_id");

-- CreateIndex
CREATE INDEX "orders_client_id_idx" ON "orders"("client_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_order_number_idx" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_promised_date_idx" ON "orders"("promised_date");

-- CreateIndex
CREATE INDEX "orders_stylist_id_status_idx" ON "orders"("stylist_id", "status");

-- CreateIndex
CREATE INDEX "orders_stylist_id_deleted_at_idx" ON "orders"("stylist_id", "deleted_at");

-- CreateIndex
CREATE INDEX "order_photos_order_id_idx" ON "order_photos"("order_id");

-- CreateIndex
CREATE INDEX "order_photos_order_id_photo_type_idx" ON "order_photos"("order_id", "photo_type");

-- CreateIndex
CREATE INDEX "order_history_order_id_idx" ON "order_history"("order_id");

-- CreateIndex
CREATE INDEX "order_history_order_id_created_at_idx" ON "order_history"("order_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "stylists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_history" ADD CONSTRAINT "order_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
