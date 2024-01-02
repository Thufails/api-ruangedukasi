const { order, course, userCourseContent, admin } = require("../../models");

const verificationPayment = async(req, res) => {
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
                message: "Email Anda tidak memiliki akses",
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
                message: "Transaksi tidak ditemukan, atau status sudah dibayar",
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
            select: {
                courseName: true,
                studentCount: true,
            },
        });

        const nowStudentCount = checkCourse.studentCount;
        const updateStudentCount = nowStudentCount + 1;

        // Add course content user
        await userCourseContent.create({
            data: {
                userId: checkOrder.userId,
                courseId: checkOrder.courseId,
                courseName: checkCourse.courseName,
                courseCount: null,
            },
        });

        await course.update({
            where: {
                id: courseId,
            },
            data: {
                studentCount: parseInt(updateStudentCount),
            },
        });

        return res.status(200).json({
            error: false,
            message: "Pembayaran telah dikonfirmasi",
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