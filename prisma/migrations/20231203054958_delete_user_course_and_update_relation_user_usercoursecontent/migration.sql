/*
  Warnings:

  - You are about to drop the column `user_course_id` on the `usercoursecontent` table. All the data in the column will be lost.
  - You are about to drop the `usercourse` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `course_count` to the `usercoursecontent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "usercourse" DROP CONSTRAINT "usercourse_user_id_fkey";

-- DropForeignKey
ALTER TABLE "usercoursecontent" DROP CONSTRAINT "usercoursecontent_user_course_id_fkey";

-- AlterTable
ALTER TABLE "usercoursecontent" DROP COLUMN "user_course_id",
ADD COLUMN     "course_count" INTEGER NOT NULL;

-- DropTable
DROP TABLE "usercourse";
