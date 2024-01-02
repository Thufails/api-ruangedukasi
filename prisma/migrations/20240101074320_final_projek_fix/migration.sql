/*
  Warnings:

  - You are about to drop the column `parentId` on the `discussion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "discussion" DROP CONSTRAINT "discussion_courseId_fkey";

-- DropForeignKey
ALTER TABLE "discussion" DROP CONSTRAINT "discussion_parentId_fkey";

-- DropForeignKey
ALTER TABLE "discussion" DROP CONSTRAINT "discussion_userId_fkey";

-- AlterTable
ALTER TABLE "discussion" DROP COLUMN "parentId",
ALTER COLUMN "courseId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "comment" DROP NOT NULL;

-- CreateTable
CREATE TABLE "discussion_reply" (
    "id" SERIAL NOT NULL,
    "parentId" INTEGER,
    "discussionId" INTEGER,
    "userId" INTEGER,
    "reply" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussion_reply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion" ADD CONSTRAINT "discussion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_reply" ADD CONSTRAINT "discussion_reply_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_reply" ADD CONSTRAINT "discussion_reply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
