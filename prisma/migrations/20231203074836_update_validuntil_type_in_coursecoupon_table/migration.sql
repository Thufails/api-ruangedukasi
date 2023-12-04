/*
  Warnings:

  - The `valid_until` column on the `coursecoupon` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "coursecoupon" DROP COLUMN "valid_until",
ADD COLUMN     "valid_until" TIMESTAMP(3);
