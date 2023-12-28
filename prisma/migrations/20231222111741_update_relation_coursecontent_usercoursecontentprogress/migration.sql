/*
  Warnings:

  - You are about to drop the column `userCourseContentId` on the `coursecontentprogress` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "coursecontentprogress" DROP CONSTRAINT "coursecontentprogress_userCourseContentId_fkey";

-- AlterTable
ALTER TABLE "coursecontentprogress" DROP COLUMN "userCourseContentId",
ADD COLUMN     "courseContentId" INTEGER;

-- AddForeignKey
ALTER TABLE "coursecontentprogress" ADD CONSTRAINT "coursecontentprogress_courseContentId_fkey" FOREIGN KEY ("courseContentId") REFERENCES "coursecontent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
