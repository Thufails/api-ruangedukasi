const {
  course,
  courseContent,
  courseType,
  courseCategory,
  courseLevel,
  userCourseContent,
  coursePPN,
  userCourseContentProgress,
} = require("../../models");

const addCourseProgress = async (req, res) => {
  try {
    const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
    const { courseId, contentId } = req.params;

    const checkCourseName = await course.findFirst({
      where: {
        id: parseInt(courseId),
      },
      select: {
        courseName: true,
      },
    });

    const checkValidContent = await courseContent.count({
      where: {
        courseId: parseInt(courseId),
        id: parseInt(contentId),
      },
    });

    if (checkValidContent == 0) {
      return res.status(404).json({
        error: true,
        message: `Course #${courseId} hasn't content #${contentId}`,
      });
    }

    const checkValidUserContent = await userCourseContent.count({
      where: {
        courseId: parseInt(courseId),
        userId: parseInt(jwtUserId),
      },
    });

    if (checkValidUserContent == 0) {
      return res.status(404).json({
        error: true,
        message: `You haven't this course`,
      });
    }

    const countProgress = await userCourseContentProgress.count({
      where: {
        userId: parseInt(jwtUserId),
        courseId: parseInt(courseId),
        courseContentId: parseInt(contentId),
      },
    });

    if (countProgress == 0) {
      try {
        const data = await userCourseContentProgress.create({
          data: {
            userId: parseInt(jwtUserId),
            courseId: parseInt(courseId),
            courseContentId: parseInt(contentId),
            status: "Done",
            courseName: checkCourseName.courseName,
          },
        });

        return res.status(201).json({
          error: false,
          message: "Successful add progress",
          response: data,
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          error: true,
          message: "Internal Server Error",
        });
      }
    }

    return res.status(200).json({
      error: false,
      message: "Progress already added",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error || "Internal server error",
    });
  }
};

const showCourseProgress = async (req, res) => {
  try {
    const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
    const courseId = req.params.courseId;

    const checkTotalContentCourse = await courseContent.count({
      where: {
        courseId: parseInt(courseId),
      },
    });

    const checkTotalContentCourseProgress =
      await userCourseContentProgress.count({
        where: {
          courseId: parseInt(courseId),
          userId: parseInt(jwtUserId),
        },
      });

    const percentProgress =
      (checkTotalContentCourseProgress / checkTotalContentCourse) * 100;

    const dataUserCourseContentProgress =
      await userCourseContentProgress.findMany({
        where: {
          userId: parseInt(jwtUserId),
          courseId: parseInt(courseId),
        },
        orderBy: {
          id: "asc",
        },
      });

    const dataCourseContent = await courseContent.findMany({
      where: {
        courseId: parseInt(courseId),
      },
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        contentTitle: true,
        videoLink: true,
        courseId: true,
        status: true,
      },
    });

    const responseData = {
      percentProgress,
      dataCourseContent,
      dataUserCourseContentProgress,
    };

    return res.status(200).json({
      error: false,
      response: responseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error || "Internal server error",
    });
  }
};

module.exports = {
  addCourseProgress,
  showCourseProgress,
};
