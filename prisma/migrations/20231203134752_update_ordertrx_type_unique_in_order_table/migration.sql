/*
  Warnings:

  - A unique constraint covering the columns `[order_trx]` on the table `order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "order_order_trx_key" ON "order"("order_trx");
