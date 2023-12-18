const { course, courseContent } = require("../../models");

const searchCourse = async (req, res) => {
  try {
    const courseSearchParams = req.query.course; // course is query params key
    const data = await course.findMany({
      where: {
        courseName: {
          contains: courseSearchParams,
          mode: "insensitive",
        },
      },
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        instructorName: true,
        courseName: true,
        courseDescription: true,
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
      },
    });

    // Convert BigInt to string before sending the response
    const responseData = data.map((course) => ({
      ...course,
      price: course.price ? parseFloat(course.price) : null,
      courseType: course.CourseType.typeName,
      courseCategory: course.CourseCategory.categoryName,
      courseLevel: course.CourseLevel.levelName,
    }));

    responseData.forEach((course) => {
      delete course.CourseType;
      delete course.CourseCategory;
      delete course.CourseLevel;
    });

    const responseDataLength = responseData.length;
    if (responseDataLength !== 0) {
      return res.status(200).json({
        error: false,
        message: `Load course with query "${courseSearchParams}" successful`,
        response: responseData,
      });
    }

    return res.status(404).json({
      error: false,
      message: `Course with query "${courseSearchParams}" not found`,
      response: null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const searchMultiCourse = async (req, res) => {
  try {
    const catSearchParams = req.query.catId; // category is query params key

    const categorySearchArray = Array.isArray(catSearchParams)
      ? catSearchParams.map(Number)
      : [Number(catSearchParams)];

    const data = await course.findMany({
      where: {
        courseCategoryId: {
          in: categorySearchArray,
        },
      },
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        instructorName: true,
        courseName: true,
        courseDescription: true,
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
      },
    });

    // Convert BigInt to string before sending the response
    const responseData = data.map((course) => ({
      ...course,
      price: course.price ? parseFloat(course.price) : null,
      courseType: course.CourseType.typeName,
      courseCategory: course.CourseCategory.categoryName,
      courseLevel: course.CourseLevel.levelName,
    }));

    responseData.forEach((course) => {
      delete course.CourseType;
      delete course.CourseCategory;
      delete course.CourseLevel;
    });

    const responseDataLength = responseData.length;
    if (responseDataLength !== 0) {
      return res.status(200).json({
        error: false,
        message: `Load course with query "${categorySearchArray}" successful`,
        response: responseData,
      });
    }

    return res.status(404).json({
      error: false,
      message: `Course with query "${categorySearchArray}" not found`,
      response: null,
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
  searchCourse,
  searchMultiCourse,
};
