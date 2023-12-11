const {
  course,
  courseContent,
  courseType,
  courseCategory,
  courseLevel,
} = require("../../models");

const popularCourse = async (req, res) => {
  try {
    const data = await course.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        instructorName: true,
        courseName: true,
        courseDescription: true,
        imageUrl: true,
        price: true,
        rating: true,
        CourseCategory: {
          select: {
            categoryName: true,
          },
        },
        CourseType: {
          select: {
            typeName: true,
          },
        },
        CourseLevel: {
          select: {
            levelName: true,
          },
        },
        userCourseContent: {
          select: {
            id: true,
            userId: true,
            courseId: true,
            courseName: true,
          },
        },
      },
    });

    // Convert BigInt to string before sending the response
    const responseData = data.map((course) => ({
      ...course,
      userCount: course.userCourseContent.length,
      thumbnailCourse: course.imageUrl,
      price: course.price ? parseFloat(course.price) : null,
      courseType: course.CourseType.typeName,
      courseCategory: course.CourseCategory.categoryName,
      courseLevel: course.CourseLevel.levelName,
    }));

    responseData.forEach((course) => {
      delete course.userCourseContent;
      delete course.CourseType;
      delete course.CourseCategory;
      delete course.CourseLevel;
      delete course.imageUrl;
    });

    responseData.sort((a, b) => b.userCount - a.userCount); // Descending based on userCount

    const limitedResponseData = responseData.slice(0, 7); // 7 data for response

    return res.status(200).json({
      error: false,
      message: "Load course successful",
      response: limitedResponseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const popularCourseCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);

    const data = await course.findMany({
      where: {
        courseCategoryId: categoryId,
      },
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        instructorName: true,
        courseName: true,
        courseDescription: true,
        imageUrl: true,
        price: true,
        rating: true,
        CourseCategory: {
          select: {
            categoryName: true,
          },
        },
        CourseType: {
          select: {
            typeName: true,
          },
        },
        CourseLevel: {
          select: {
            levelName: true,
          },
        },
        userCourseContent: {
          select: {
            id: true,
            userId: true,
            courseId: true,
            courseName: true,
          },
        },
      },
    });

    // Convert BigInt to string before sending the response
    const responseData = data.map((course) => ({
      ...course,
      userCount: course.userCourseContent.length,
      thumbnailCourse: course.imageUrl,
      price: course.price ? parseFloat(course.price) : null,
      courseType: course.CourseType.typeName,
      courseCategory: course.CourseCategory.categoryName,
      courseLevel: course.CourseLevel.levelName,
    }));

    responseData.forEach((course) => {
      delete course.userCourseContent;
      delete course.CourseType;
      delete course.CourseCategory;
      delete course.CourseLevel;
      delete course.imageUrl;
    });

    responseData.sort((a, b) => b.userCount - a.userCount); // Descending based on userCount

    const limitedResponseData = responseData.slice(0, 7); // 7 data for response

    return res.status(200).json({
      error: false,
      message: "Load course successful",
      response: limitedResponseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

module.exports = {
  popularCourse,
  popularCourseCategory,
};
