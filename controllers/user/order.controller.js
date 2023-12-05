const {
  user,
  order,
  course,
  userCourseContent,
  courseCoupon,
} = require("../../models");
const utils = require("../../utils");

let discPercent = 0;
let courseCouponId = null;

const orderCourse = async (req, res) => {
  try {
    const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
    const courseId = req.params.courseId; // params courseId from course.route

    const checkCourse = await course.findFirst({
      where: {
        id: parseInt(courseId),
      },
      select: {
        price: true,
        courseName: true,
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
    const accountNumber = await utils.dummyAccountNumber();

    const courseName = checkCourse.courseName;

    const priceInitial = parseFloat(checkCourse.price);
    const priceDiscount = parseFloat(checkCourse.price) * (discPercent / 100);
    const priceAfter = parseFloat(checkCourse.price) - priceDiscount;
    const data = await order.create({
      data: {
        userId: parseInt(jwtUserId),
        orderTrx: `RE-${encryptOrderTrx}-${randomNumber}`,
        courseId: parseInt(courseId),
        courseCouponId: parseInt(courseCouponId),
        totalPrice: parseFloat(priceAfter),
        orderDate: new Date(),
        status: "Waiting payment",
        accountNumber: accountNumber,
      },
    });

    const responseData = {
      id: data.id,
      orderTrx: data.orderTrx,
      courseName: courseName,
      initialPrice: priceInitial ? parseFloat(priceInitial) : null,
      discountPercent: discPercent ? parseFloat(discPercent) : 0,
      discountPrice: priceDiscount ? parseFloat(priceDiscount) : 0,
      totalPrice: data.totalPrice ? parseFloat(data.totalPrice) : null,
      accountNumber: data.accountNumber,
      status: data.status,
      orderDate: data.orderDate,
    };

    discPercent = 0;
    courseCouponId = null;

    return res.status(201).json({
      error: false,
      message: "Order course successful",
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

const checkCoupon = async (req, res) => {
  try {
    const { coupon_code } = req.body;
    const courseId = req.params.courseId; // params courseId from course.route

    // Coupon code not null
    if (coupon_code != null) {
      const checkCoupon = await courseCoupon.findFirst({
        where: {
          couponCode: coupon_code,
          courseId: parseInt(courseId),
        },
      });

      const dateNow = new Date(); // Date time server now
      if (
        checkCoupon &&
        dateNow < checkCoupon.validUntil &&
        checkCoupon.status == "Active"
      ) {
        // Use discount percent
        discPercent = checkCoupon.discountPercent;
        courseCouponId = checkCoupon.id;
        return res.status(200).json({
          error: false,
          message: "Successfully use coupon",
          dicount: discPercent,
        });
      } else {
        return res.status(200).json({
          error: true,
          message: "Coupon code not valid",
          dicount: discPercent,
        });
      }
    }

    return res.status(200).json({
      error: true,
      message: "Please input a valid coupon code",
      dicount: discPercent,
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
  orderCourse,
  checkCoupon,
};
