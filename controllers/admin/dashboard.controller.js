const { course, admin, order } = require("../../models");

const viewSummaryClass = async(req, res) => {
    try {
        const jwtAdminId = res.sessionLogin.id; // From checktoken middlewares

        const cekAkses = await admin.findUnique({
            where: {
                id: jwtAdminId,
            },
        });

        if (!cekAkses) {
            return res.status(403).json({
                error: true,
                message: "Anda tidak memiliki akses di halaman ini",
            });
        }

        const freeClass = await course.count({
            where: {
                adminId: parseInt(jwtAdminId),
                courseTypeId: 1, // 1 is free
            },
        });

        const premiumClass = await course.count({
            where: {
                adminId: parseInt(jwtAdminId),
                courseTypeId: 2, // 2 is premium
            },
        });

        const totalClass = freeClass + premiumClass;

        const responseData = {
            totalCourse: totalClass,
            freeCourse: freeClass,
            premiumCourse: premiumClass,
        };

        return res.status(200).json({
            error: false,
            message: "Data berhasil dimuat",
            responseCourse: responseData,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error || "Internal server error",
        });
    }
};

async function getOrdersForCourse(courseId) {
    try {
        const orders = await order.findMany({
            where: {
                courseId: courseId,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                orderTrx: true,
                userId: true,
                totalPrice: true,
                accountNumber: true,
                createdAt: true,
                status: true,
            },
        });

        // Convert BigInt to string before sending the response
        const responseData = orders.map((data) => ({
            ...data,
            totalPrice: data.totalPrice ? parseFloat(data.totalPrice) : null,
            orderTrx: data.orderTrx ? data.orderTrx.toString() : null,
        }));

        return responseData;
    } catch (error) {
        throw error;
    }
}

const ownedClass = async(req, res) => {
    try {
        const jwtAdminId = res.sessionLogin.id; // From checktoken middlewares

        const cekAkses = await admin.findUnique({
            where: {
                id: jwtAdminId,
            },
        });

        if (!cekAkses) {
            return res.status(403).json({
                error: true,
                message: "Anda tidak memiliki akses ke halaman ini",
            });
        }

        const data = await course.findMany({
            where: {
                adminId: jwtAdminId,
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

        const responseData = data.map((course) => ({
            ...course,
            userCount: course.userCourseContent.length,
            thumbnailCourse: course.imageUrl,
            price: course.price ? parseFloat(course.price) : null,
            courseType: course.CourseType.typeName,
            courseCategory: course.CourseCategory.categoryName,
            courseLevel: course.CourseLevel.levelName,
        }));

        const freeClass = await course.count({
            where: {
                adminId: parseInt(jwtAdminId),
                courseTypeId: 1, // 1 is free
            },
        });

        const premiumClass = await course.count({
            where: {
                adminId: parseInt(jwtAdminId),
                courseTypeId: 2, // 2 is premium
            },
        });

        const totalClass = freeClass + premiumClass;

        let totalUserInClass = 0;

        for (const course of responseData) {
            const ordersForCourse = await getOrdersForCourse(course.id);
            course.orders = ordersForCourse;
            totalUserInClass += course.userCount;

            delete course.userCourseContent;
            delete course.CourseType;
            delete course.CourseCategory;
            delete course.CourseLevel;
            delete course.imageUrl;
        }

        return res.status(200).json({
            error: false,
            message: "Memuat kursus berhasil",
            response: {
                adminId: jwtAdminId,
                totalCourse: totalClass,
                freeCourse: freeClass,
                premiumCourse: premiumClass,
                totalStudent: totalUserInClass,
                myCourse: responseData,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: error.message || "Internal server error",
        });
    }
};

module.exports = {
    viewSummaryClass,
    ownedClass,
};