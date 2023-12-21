const {
  user,
  order,
  course,
  userCourseContent,
  courseType,
} = require("../../models");
const utils = require("../../utils");

const enrollCourse = async (req, res) => {
  try {
    const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
    const courseId = req.params.courseId; // params courseId from course.route

    const alreadyEnroll = await order.findFirst({
      where: {
        courseId: parseInt(courseId),
        userId: parseInt(jwtUserId),
      },
    });

    if (alreadyEnroll) {
      return res.status(200).json({
        error: false,
        message: "Course already enroll",
      });
    }

    const alreadyInCourse = await userCourseContent.findFirst({
      where: {
        courseId: parseInt(courseId),
        userId: parseInt(jwtUserId),
      },
    });

    if (alreadyInCourse) {
      return res.status(200).json({
        error: false,
        message: "Course already active",
      });
    }

    const cekTypeCourse = await course.findFirst({
      where: {
        id: parseInt(courseId),
      },
      select: {
        courseTypeId: true,
      },
    });

    const valueTypeCourse = cekTypeCourse.courseTypeId;
    if (parseInt(valueTypeCourse) != 2) {
      return res.status(200).json({
        error: false,
        message: "Enroll only for free course",
      });
    }

    const checkCourse = await course.findFirst({
      where: {
        id: parseInt(courseId),
      },
      select: {
        price: true,
        courseName: true,
        studentCount: true,
        courseCoupon: {
          select: {
            id: true,
            couponCode: true,
            discountPercent: true,
            validUntil: true,
          },
        },
      },
    });

    const encryptOrderTrx = await utils.encryptOrder();
    const randomNumber = Math.floor(10000 + Math.random() * 90000);

    const courseName = checkCourse.courseName;

    const data = await order.create({
      data: {
        userId: parseInt(jwtUserId),
        orderTrx: `RE-${encryptOrderTrx}-${randomNumber}`,
        courseId: parseInt(courseId),
        courseCouponId: null,
        totalPrice: 0,
        orderDate: new Date(),
        status: "Paid",
        accountNumber: "-",
      },
    });

    const responseData = {
      id: data.id,
      orderTrx: data.orderTrx,
      courseName: courseName,
      initialPrice: 0,
      discountPercent: 0,
      discountPrice: 0,
      totalPrice: 0,
      accountNumber: data.accountNumber,
      status: data.status,
      orderDate: data.orderDate,
    };

    discPercent = 0;
    courseCouponId = null;

    await userCourseContent.create({
      data: {
        userId: parseInt(jwtUserId),
        courseId: parseInt(courseId),
        courseName: courseName,
      },
    });

    const nowStudentCount = checkCourse.studentCount;
    const updateStudentCount = nowStudentCount + 1;

    await course.update({
      where: {
        id: parseInt(courseId),
      },
      data: {
        studentCount: parseInt(updateStudentCount),
      },
    });

    return res.status(201).json({
      error: false,
      message: "Enroll course successful",
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
  enrollCourse,
};
