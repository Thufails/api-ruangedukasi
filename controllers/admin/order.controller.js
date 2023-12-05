const { order, course, userCourseContent, admin } = require("../../models");

const verificationPayment = async (req, res) => {
  try {
    const jwtAdminId = res.sessionLogin.id; // From checktoken middlewares
    const trxId = req.params.trxId; // params trxId from order.route

    const checkAdmin = await admin.findUnique({
      where: {
        id: parseInt(jwtAdminId),
      },
    });

    if (!checkAdmin) {
      return res.status(403).json({
        error: true,
        message: "Your email doesn't have access",
      });
    }

    const checkOrder = await order.findUnique({
      where: {
        orderTrx: trxId,
        status: "Waiting payment",
      },
    });

    if (!checkOrder) {
      return res.status(404).json({
        error: true,
        message: "Transaction not found, or status is already paid",
      });
    }

    // Change status in order
    await order.update({
      data: {
        status: "Paid",
      },
      where: {
        orderTrx: trxId,
      },
    });

    const courseId = checkOrder.courseId;
    const checkCourse = await course.findFirst({
      where: {
        id: courseId,
      },
    });
    // Add course content user
    await userCourseContent.create({
      data: {
        userId: checkOrder.userId,
        courseId: checkOrder.courseId,
        courseName: checkCourse.courseName,
        courseCount: null,
      },
    });

    return res.status(200).json({
      error: false,
      message: "Payment has been confirmed",
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
  verificationPayment,
};
