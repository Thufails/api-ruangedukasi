const { user } = require("../../models");

const profileDashboard = async (req, res) => {
  try {
    const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
    const data = await user.findFirst({
      where: {
        id: jwtUserId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        imageUrl: true,
        phoneNumber: true,
        city: true,
        country: true,
        status: true,
        order: {
          where: {
            userId: jwtUserId,
          },
          select: {
            id: true,
            orderTrx: true,
            totalPrice: true,
            status: true,
            accountNumber: true,
            orderDate: true,
            Course: {
              select: {
                courseName: true,
                imageUrl: true,
              },
            },
          },
        },
        userCourseContent: {
          select: {
            courseId: true,
            courseName: true,
            Course: {
              select: {
                instructorName: true,
                rating: true,
                imageUrl: true,
                CourseType: {
                  select: {
                    typeName: true,
                  },
                },
                CourseCategory: {
                  select: {
                    categoryName: true,
                    imageUrl: true,
                  },
                },
                CourseLevel: {
                  select: {
                    levelName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (data.order) {
      data.order.forEach((order) => {
        order.totalPrice = order.totalPrice
          ? parseFloat(order.totalPrice)
          : null;
      });
    }

    const responseData = {
      ...data,
      riwayatOrder: data.order.map((dataOrder) => ({
        id: dataOrder.id,
        orderTrx: dataOrder.orderTrx,
        courseName: dataOrder.Course.courseName,
        thumbnailCourse: dataOrder.Course.imageUrl,
        totalPrice: dataOrder.totalPrice,
        status: dataOrder.status,
        accountNumber: dataOrder.accountNumber,
        orderDate: data.orderDate,
      })),
      myCourse: data.userCourseContent.map((dataUserCourse) => ({
        courseId: dataUserCourse.courseId,
        courseName: dataUserCourse.courseName,
        instructorName: dataUserCourse.Course.instructorName,
        thumbnailCourse: dataUserCourse.Course.imageUrl,
        courseType: dataUserCourse.Course.CourseType.typeName,
        courseCategory: dataUserCourse.Course.CourseCategory.categoryName,
        courseLevel: dataUserCourse.Course.CourseLevel.levelName,
      })),
    };

    delete responseData["order"];
    delete responseData["userCourseContent"];

    return res.status(200).json({
      error: false,
      message: "Load dashboard successful",
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
  profileDashboard,
};
