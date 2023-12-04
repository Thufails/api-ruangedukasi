const {
  admin,
  course,
  courseCoupon,
  courseContent,
  courseType,
  courseCategory,
  courseLevel,
} = require("../../models");

const allCourseCoupon = async (req, res) => {
  try {
    const jwtAdminId = res.sessionLogin.id; // From checktoken middlewares
    const findAdmin = await admin.findUnique({
      where: {
        id: jwtAdminId,
      },
    });

    if (!findAdmin) {
      return res.status(404).json({
        error: true,
        message: "Login session not valid",
      });
    }

    const data = await courseCoupon.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        couponName: true,
        couponCode: true,
        discountPercent: true,
        validUntil: true,
        status: true,
        courseId: true,
      },
    });

    return res.status(200).json({
      error: false,
      message: "Load course coupon successful",
      response: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const showCourseCoupon = async (req, res) => {
  try {
    const courseId = req.params.courseId; // params courseId from course.route
    const data = await course.findFirst({
      where: {
        id: parseInt(courseId),
      },
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        instructorName: true,
        courseName: true,
        price: true,
        courseCoupon: {
          select: {
            couponName: true,
            couponCode: true,
            validUntil: true,
            discountPercent: true,
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

    // Convert BigInt to float before sending the response
    const responseData = {
      ...data,
      price: data.price ? parseFloat(data.price) : null,
      courseType: checkTypeName.typeName,
      courseCategory: checkCategoryName.categoryName,
      courseLevel: checkLevelName.levelName,
    };

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

module.exports = {
  allCourseCoupon,
  showCourseCoupon,
};
