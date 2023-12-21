const {
  user,
  order,
  course,
  userCourseContent,
  courseCoupon,
  coursePPN,
} = require("../../models");
const utils = require("../../utils");

let discPercent = 0;
let courseCouponId = null;

const orderCourse = async (req, res) => {
  try {
    const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
    const courseId = req.params.courseId; // params courseId from course.route

    const alreadyOrder = await order.findFirst({
      where: {
        courseId: parseInt(courseId),
        userId: parseInt(jwtUserId),
      },
    });

    if (alreadyOrder) {
      return res.status(200).json({
        error: false,
        message: "Course already order",
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
    if (parseInt(valueTypeCourse) != 1) {
      return res.status(200).json({
        error: false,
        message: "Order only for premium course",
      });
    }

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

    // Check Pajak
    const dataPajak = await coursePPN.findFirst({
      select: {
        ppn: true,
      },
    });

    const encryptOrderTrx = await utils.encryptOrder();
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const accountNumber = await utils.dummyAccountNumber();

    const courseName = checkCourse.courseName;

    const priceInitial = parseFloat(checkCourse.price);
    const priceDiscount = parseFloat(checkCourse.price) * (discPercent / 100);
    const priceAfter = parseFloat(checkCourse.price) - priceDiscount;
    const ppnPrice = (parseInt(dataPajak.ppn) / 100) * priceAfter;
    const finalPrice = parseFloat(priceAfter) + parseFloat(ppnPrice);

    const data = await order.create({
      data: {
        userId: parseInt(jwtUserId),
        orderTrx: `RE-${encryptOrderTrx}-${randomNumber}`,
        courseId: parseInt(courseId),
        courseCouponId: parseInt(courseCouponId),
        totalPrice: parseFloat(finalPrice),
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
      priceAfterDiscount: parseFloat(priceAfter),
      ppnPercent: parseInt(dataPajak.ppn),
      ppnPrice: parseFloat(ppnPrice),
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

        // Check Course
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

        // Check Pajak
        const dataPajak = await coursePPN.findFirst({
          select: {
            ppn: true,
          },
        });

        // Course + Pajak
        const priceInitial = parseFloat(checkCourse.price);
        const priceDiscount =
          parseFloat(checkCourse.price) * (discPercent / 100);
        const priceAfterDiscount =
          parseFloat(checkCourse.price) - priceDiscount;

        const ppnPriceAfterDiscount =
          (parseInt(dataPajak.ppn) / 100) * priceAfterDiscount;
        const finalPrice =
          parseFloat(priceAfterDiscount) + parseFloat(ppnPriceAfterDiscount);

        const responseDataCoupon = {
          initialPrice: priceInitial ? parseFloat(priceInitial) : null,
          discountPercent: discPercent ? parseFloat(discPercent) : 0,
          discountPrice: priceDiscount ? parseFloat(priceDiscount) : 0,
          priceAfterDiscount: parseFloat(priceAfterDiscount),
          ppnPercent: parseInt(dataPajak.ppn),
          ppnPrice: parseFloat(ppnPriceAfterDiscount),
          totalPrice: parseFloat(finalPrice),
        };

        return res.status(200).json({
          error: false,
          message: "Successfully use coupon",
          responseCoupon: responseDataCoupon,
        });
      } else {
        discPercent = 0; // Set discount to 0

        return res.status(200).json({
          error: true,
          message: "Coupon code not valid",
          dicount: discPercent,
        });
      }
    }

    discPercent = 0; // Set discount to 0
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
