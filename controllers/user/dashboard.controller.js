const { user, userCourseContent } = require("../../models");

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
          },
        },
      },
    });

    delete data["password"]; // hide password field in response

    if (data.order) {
      data.order.forEach((order) => {
        order.totalPrice = order.totalPrice
          ? parseFloat(order.totalPrice)
          : null;
      });
    }

    const responseData = {
      ...data,
    };

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
