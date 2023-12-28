-- CreateTable
CREATE TABLE "coursecontentprogress" (
    "id" SERIAL NOT NULL,
    "course_name" TEXT,
    "status" TEXT,
    "userId" INTEGER,
    "courseId" INTEGER,
    "userCourseContentId" INTEGER,

    CONSTRAINT "coursecontentprogress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "coursecontentprogress" ADD CONSTRAINT "coursecontentprogress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coursecontentprogress" ADD CONSTRAINT "coursecontentprogress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coursecontentprogress" ADD CONSTRAINT "coursecontentprogress_userCourseContentId_fkey" FOREIGN KEY ("userCourseContentId") REFERENCES "usercoursecontent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
