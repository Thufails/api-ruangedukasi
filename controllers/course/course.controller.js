const {
  course,
  courseContent,
  courseType,
  courseCategory,
  courseLevel,
  userCourseContent,
  coursePPN,
} = require("../../models");

const allCourse = async (req, res) => {
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

    return res.status(200).json({
      error: false,
      message: "Load course successful",
      response: responseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const detailCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId; // params courseId from course.route
    let jwtUserId = null;
    let alreadyBuy = false;
    let boolShowVideo = false;

    try {
      jwtUserId = res.sessionLogin.id ? res.sessionLogin.id : null; // From checktoken middlewares
    } catch (error) {
      jwtUserId = null;
    }

    if (jwtUserId != null || jwtUserId != undefined) {
      const cekAlreadyBuy = await userCourseContent.findFirst({
        where: {
          courseId: parseInt(courseId),
          userId: parseInt(jwtUserId),
        },
      });

      if (cekAlreadyBuy) {
        boolShowVideo = true;
        alreadyBuy = true;
      }
    }

    const data = await course.findFirst({
      where: {
        id: parseInt(courseId),
      },
      orderBy: {
        id: "asc",
      },
      include: {
        courseContent: {
          select: {
            id: true,
            contentTitle: true,
            videoLink: boolShowVideo,
            status: true,
          },
        },
        courseSkill: {
          select: {
            id: true,
            skillName: true,
          },
        },
        courseTarget: {
          select: {
            id: true,
            description: true,
          },
        },
        courseReview: {
          select: {
            id: true,
            userId: true,
            review: true,
            rating: true,
            createdAt: true,
            updatedAt: true,
            User: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    // Check courseTypeId
    const valueTypeId = data.courseTypeId;
    const checkTypeName = await courseType.findFirst({
      where: {
        id: valueTypeId,
      },
    });

    // Check courseCategoryId
    const valueCategoryId = data.courseCategoryId;
    const checkCategoryName = await courseCategory.findFirst({
      where: {
        id: valueCategoryId,
      },
    });

    // Check courseLevelId
    const valueLevelId = data.courseLevelId;
    const checkLevelName = await courseLevel.findFirst({
      where: {
        id: valueLevelId,
      },
    });

    delete data["courseTypeId"];
    delete data["courseCategoryId"];
    delete data["courseLevelId"];
    delete data["adminId"];

    if (!data) {
      // Handle where no course is found with the given courseId
      return res.status(404).json({
        error: true,
        message: `Course with id #${courseId} not found`,
        response: null,
      });
    }

    // Check length in courseContent
    const courseContentLength = data.courseContent.length;

    // Check Pajak
    const dataPajak = await coursePPN.findFirst({
      select: {
        ppn: true,
      },
    });
    const priceFinal = data.price ? parseFloat(data.price) : 0;
    const ppnPrice = (parseInt(dataPajak.ppn) / 100) * priceFinal;

    // Convert BigInt to float before sending the response
    const responseData = {
      ...data,
      ppnPercent: parseInt(dataPajak.ppn),
      ppnPrice: parseFloat(ppnPrice),
      priceAfterPpn: parseFloat(priceFinal) + parseFloat(ppnPrice),
      alreadyBuy: alreadyBuy,
      rating: data.rating ? parseFloat(data.rating.toFixed(2)) : null,
      price: data.price ? parseFloat(data.price) : null,
      contentCount: parseInt(courseContentLength),
      review: data.courseReview.map((courseReview) => ({
        id: courseReview.id,
        userId: courseReview.userId,
        fullName: courseReview.User.fullName,
        review: courseReview.review,
        rating: courseReview.rating,
        createdAt: courseReview.createdAt,
        updatedAt: courseReview.updatedAt,
      })),
      courseType: checkTypeName.typeName,
      courseCategory: checkCategoryName.categoryName,
      courseLevel: checkLevelName.levelName,
    };

    delete responseData["courseReview"];

    return res.status(200).json({
      error: false,
      message: `Load course with id #${courseId} successful`,
      response: responseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const allCourseCategory = async (req, res) => {
  try {
    const catId = parseInt(req.params.categoryId);

    const checkCategory = await courseCategory.findUnique({
      where: {
        id: catId,
      },
    });

    if (!checkCategory) {
      return res.status(404).json({
        error: true,
        message: "Category not found",
      });
    }

    const data = await course.findMany({
      where: {
        courseCategoryId: catId,
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

    return res.status(200).json({
      error: false,
      message: "Load course successful",
      response: responseData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: true,
      message: error || "Internal server error",
    });
  }
};

module.exports = {
  allCourse,
  detailCourse,
  allCourseCategory,
};
