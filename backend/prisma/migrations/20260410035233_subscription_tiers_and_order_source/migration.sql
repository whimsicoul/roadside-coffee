-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "subscription_id" INTEGER;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "pickup_time" TEXT NOT NULL DEFAULT '08:00',
ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'drink';

-- CreateIndex
CREATE INDEX "Order_subscription_id_idx" ON "Order"("subscription_id");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
