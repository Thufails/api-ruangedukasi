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
            courseId: true,
            orderTrx: true,
            totalPrice: true,
            status: true,
            accountNumber: true,
            orderDate: true,
            Course: {
              select: {
                courseName: true,
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
                courseContent: {
                  select: {
                    contentTitle: true,
                  },
                },
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
                courseName: true,
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
                courseContent: {
                  select: {
                    contentTitle: true,
                  },
                },
                userCourseContentProgress: {
                  select: {
                    userId: true,
                    courseName: true,
                    status: true,
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
      riwayatOrder: data.order.map((dataOrder) => {
        const courseId = dataOrder.courseId;

        const courseCount = dataOrder.Course.courseContent.length;

        return {
          id: dataOrder.id,
          orderTrx: dataOrder.orderTrx,
          courseId: courseId,
          courseName: dataOrder.Course.courseName,
          instructorName: dataOrder.Course.instructorName,
          thumbnailCourse: dataOrder.Course.imageUrl,
          courseType: dataOrder.Course.CourseType.typeName,
          courseCategory: dataOrder.Course.CourseCategory.categoryName,
          courseLevel: dataOrder.Course.CourseLevel.levelName,
          courseContent: courseCount,
          courseRating: dataOrder.Course.rating,
          totalPrice: dataOrder.totalPrice,
          status: dataOrder.status,
          accountNumber: dataOrder.accountNumber,
          orderDate: data.orderDate,
        };
      }),
      myCourse: data.userCourseContent.map((dataUserCourse) => {
        const courseId = dataUserCourse.courseId;
        const userId = jwtUserId;

        const courseCount = dataUserCourse.Course.courseContent.length;

        const userCourseContentProgress =
          dataUserCourse.Course.userCourseContentProgress.filter(
            (progress) => progress.userId == userId
          );

        const percentProgress = parseFloat(
          (userCourseContentProgress.length / courseCount) * 100
        );

        return {
          courseId: courseId,
          courseName: dataUserCourse.courseName,
          instructorName: dataUserCourse.Course.instructorName,
          thumbnailCourse: dataUserCourse.Course.imageUrl,
          courseType: dataUserCourse.Course.CourseType.typeName,
          courseCategory: dataUserCourse.Course.CourseCategory.categoryName,
          courseLevel: dataUserCourse.Course.CourseLevel.levelName,
          courseContent: courseCount,
          courseRating: dataUserCourse.Course.rating,
          percentProgress: parseFloat(percentProgress.toFixed(2)),
        };
      }),
    };

    delete responseData["order"];
    delete responseData["userCourseContent"];

    return res.status(200).json({
      error: false,
      message: "Muat dashboard berhasil",
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

const dashboardSearch = async (req, res) => {
  try {
    const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
    const catSearchParams = req.query.catId;
    const levelSearchParams = req.query.levelId;
    const typeSearchParams = req.query.typeId;
    const newCourse = req.query.terbaru;
    let sortirCourse = "asc";

    if (newCourse != null || newCourse == "true") {
      sortirCourse = "desc";
    }

    const typeSearchArray = typeSearchParams
      ? Array.isArray(typeSearchParams)
        ? typeSearchParams.map(Number)
        : [Number(typeSearchParams)]
      : [];

    const categorySearchArray = catSearchParams
      ? Array.isArray(catSearchParams)
        ? catSearchParams.map(Number)
        : [Number(catSearchParams)]
      : [];

    const levelSearchArray = levelSearchParams
      ? Array.isArray(levelSearchParams)
        ? levelSearchParams.map(Number)
        : [Number(levelSearchParams)]
      : [];

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
        userCourseContent: {
          where: {
            Course: {
              ...(typeSearchArray.length > 0 && {
                CourseType: {
                  id: {
                    in: typeSearchArray,
                  },
                },
              }),
              ...(categorySearchArray.length > 0 && {
                CourseCategory: {
                  id: {
                    in: categorySearchArray,
                  },
                },
              }),
              ...(levelSearchArray.length > 0 && {
                CourseLevel: {
                  id: {
                    in: levelSearchArray,
                  },
                },
              }),
            },
          },
          orderBy: {
            updatedAt: sortirCourse,
          },
          select: {
            courseId: true,
            courseName: true,
            Course: {
              select: {
                courseName: true,
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
                courseContent: {
                  select: {
                    contentTitle: true,
                  },
                },
                userCourseContentProgress: {
                  select: {
                    userId: true,
                    courseName: true,
                    status: true,
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
      myCourse: data.userCourseContent.map((dataUserCourse) => {
        const courseId = dataUserCourse.courseId;
        const userId = jwtUserId;

        const courseCount = dataUserCourse.Course.courseContent.length;

        const userCourseContentProgress =
          dataUserCourse.Course.userCourseContentProgress.filter(
            (progress) => progress.userId == userId
          );

        const percentProgress = parseFloat(
          (userCourseContentProgress.length / courseCount) * 100
        );

        return {
          courseId: courseId,
          courseName: dataUserCourse.courseName,
          instructorName: dataUserCourse.Course.instructorName,
          thumbnailCourse: dataUserCourse.Course.imageUrl,
          courseType: dataUserCourse.Course.CourseType.typeName,
          courseCategory: dataUserCourse.Course.CourseCategory.categoryName,
          courseLevel: dataUserCourse.Course.CourseLevel.levelName,
          courseContent: courseCount,
          courseRating: dataUserCourse.Course.rating,
          percentProgress: percentProgress,
        };
      }),
    };

    delete responseData["userCourseContent"];

    return res.status(200).json({
      error: false,
      message: "Muat dashboard search berhasil",
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
  dashboardSearch,
};
