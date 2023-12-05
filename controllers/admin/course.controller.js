const {
    course,
    courseType,
    courseCategory,
    courseLevel,
    admin,
    courseContent,
    courseSkill,
    courseTarget,
    courseCoupon,
} = require("../../models");
const { imageKit } = require("../../utils");

module.exports = {
    addCategory: async(req, res) => {
        const { category_name } = req.body;
        try {
            const addCategory = await courseCategory.create({
                data: {
                    categoryName: category_name,
                    //imageUrl: `/images/${req.file.filename}`
                },
            });
            return res.status(201).json({
                error: false,
                message: "Category Create Succesfully",
                response: addCategory,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    },
    addLevel: async(req, res) => {
        const { level_name } = req.body;
        try {
            const addLevel = await courseLevel.create({
                data: {
                    levelName: level_name,
                },
            });
            return res.status(201).json({
                error: false,
                message: "Level Create Succesfully",
                response: addLevel,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    },
    addType: async(req, res) => {
        const { type_name } = req.body;
        try {
            const addType = await courseType.create({
                data: {
                    typeName: type_name,
                },
            });
            return res.status(201).json({
                error: false,
                message: "Type Create Succesfully",
                response: addType,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    },
    addCourse: async(req, res) => {
        const {
            instructor_name,
            course_name,
            course_description,
            price,
            rating,
            telegram_link,
            whatsapp_link,
            student_count,
            video_count,
            reading_count,
            content_count,
            course_type_id,
            course_category_id,
            course_level_id,
        } = req.body;

        try {
            //CHECK EXISTING ADMIN
            const jwtAdminId = res.sessionLogin.id; // From checktoken middlewares
            const existingUser = await admin.findUniqueOrThrow({
                where: { id: jwtAdminId },
            });

            if (!existingUser) {
                return res
                    .status(404)
                    .json({ error: true, message: "Admin Not Found" });
            }
            const addCourse = await course.create({
                data: {
                    instructorName: instructor_name,
                    courseName: course_name,
                    courseDescription: course_description,
                    price: BigInt(price),
                    rating: parseInt(rating),
                    telegramLink: telegram_link,
                    whatsappLink: whatsapp_link,
                    studentCount: student_count,
                    videoCount: video_count,
                    readingCount: reading_count,
                    contentCount: content_count,

                    CourseType: {
                        connect: { id: parseInt(course_type_id) },
                    },
                    CourseLevel: {
                        connect: { id: parseInt(course_level_id) },
                    },
                    CourseCategory: {
                        connect: { id: parseInt(course_category_id) },
                    },
                    Admin: {
                        connect: { id: jwtAdminId },
                    },
                },
            });
            const priceInt = parseInt(price);
            return res.status(201).json({
                error: false,
                message: "Course Create Succesfully",
                response: {...addCourse, price: priceInt },
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    },

    addCourseContent: async(req, res) => {
        try {
            const courseId = req.params.courseId; // courseId params from admin course.route
            const jwtAdminId = res.sessionLogin.id; // From checktoken middlewares
            const { content_title, video_link } = req.body;
            const checkAdminExist = await admin.findUniqueOrThrow({
                where: { id: jwtAdminId },
            });

            if (!checkAdminExist) {
                return res
                    .status(404)
                    .json({ error: true, message: "Admin not found" });
            }

            const addCourseContent = await courseContent.create({
                data: {
                    courseId: parseInt(courseId),
                    contentTitle: content_title,
                    videoLink: video_link,
                    status: "Active",
                },
            });

            return res.status(201).json({
                error: false,
                message: "Course content successfuly created",
                response: addCourseContent,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: true,
                message: error,
            });
        }
    },

    addCourseSkill: async(req, res) => {
        try {
            const courseId = req.params.courseId; // courseId params from admin course.route
            const jwtAdminId = res.sessionLogin.id; // From checktoken middlewares
            const { skill_name } = req.body;
            const checkAdminExist = await admin.findUniqueOrThrow({
                where: { id: jwtAdminId },
            });

            if (!checkAdminExist) {
                return res
                    .status(404)
                    .json({ error: true, message: "Admin not found" });
            }

            const addCourseSkill = await courseSkill.create({
                data: {
                    courseId: parseInt(courseId),
                    skillName: skill_name,
                },
            });

            return res.status(201).json({
                error: false,
                message: "Course skill successfuly created",
                response: addCourseSkill,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: true,
                message: error,
            });
        }
    },

    addCourseTarget: async(req, res) => {
        try {
            const courseId = req.params.courseId; // courseId params from admin course.route
            const jwtAdminId = res.sessionLogin.id; // From checktoken middlewares
            const { description } = req.body;
            const checkAdminExist = await admin.findUniqueOrThrow({
                where: { id: jwtAdminId },
            });

            if (!checkAdminExist) {
                return res
                    .status(404)
                    .json({ error: true, message: "Admin not found" });
            }

            const addCourseTarget = await courseTarget.create({
                data: {
                    courseId: parseInt(courseId),
                    description: description,
                },
            });

            return res.status(201).json({
                error: false,
                message: "Course target successfuly created",
                response: addCourseTarget,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: true,
                message: error,
            });
        }
    },

    addCourseCoupon: async(req, res) => {
        try {
            const courseId = req.params.courseId; // courseId params from admin course.route
            const jwtAdminId = res.sessionLogin.id; // From checktoken middlewares
            const { coupon_name, coupon_code, discount_percent } = req.body;
            const checkAdminExist = await admin.findUniqueOrThrow({
                where: { id: jwtAdminId },
            });

            if (!checkAdminExist) {
                return res
                    .status(404)
                    .json({ error: true, message: "Admin not found" });
            }

            const addCourseCoupon = await courseCoupon.create({
                data: {
                    courseId: parseInt(courseId),
                    couponName: coupon_name,
                    couponCode: coupon_code,
                    discountPercent: discount_percent,
                    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                    status: "Active",
                },
            });

            return res.status(201).json({
                error: false,
                message: "Course coupon successfuly created",
                response: addCourseCoupon,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: true,
                message: error,
            });
        }
    },
};