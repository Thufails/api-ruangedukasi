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
            const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

            let insertData = {
                categoryName: category_name,
            };

            if (req.file) {
                try {
                    // Check filetype upload
                    if (!allowedImageTypes.includes(req.file.mimetype)) {
                        return res.status(400).json({
                            error: true,
                            message: "Jenis file tidak valid",
                        });
                    }

                    const fileTostring = req.file.buffer.toString("base64");
                    const uploadFile = await imageKit.upload({
                        fileName: req.file.originalname,
                        file: fileTostring,
                    });

                    insertData.imageUrl = uploadFile.url;
                } catch (error) {
                    return res.status(500).json({
                        error: true,
                        message: "Terjadi kesalahan saat mengunggah gambar ke server",
                    });
                }
            }

            const addCategory = await courseCategory.create({
                data: insertData,
            });
            return res.status(201).json({
                error: false,
                message: "Kategori Berhasil Dibuat",
                response: addCategory,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    },

    updateCategory: async(req, res) => {
        try {
            const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

            const { categoryId } = req.params;
            const { category_name } = req.body;
            const readCategory = await courseCategory.findUnique({
                where: {
                    id: parseInt(categoryId),
                },
            });

            if (!readCategory) {
                return res.status(404).json({
                    success: false,
                    error: "Kategori tidak ditemukan",
                });
            }

            let updatedData = {};

            if (category_name) {
                updatedData.categoryName = category_name;
            }

            if (req.file) {
                try {
                    // Check filetype upload
                    if (!allowedImageTypes.includes(req.file.mimetype)) {
                        return res.status(400).json({
                            error: true,
                            message: "Jenis file tidak valid.",
                        });
                    }

                    const fileTostring = req.file.buffer.toString("base64");
                    const uploadFile = await imageKit.upload({
                        fileName: req.file.originalname,
                        file: fileTostring,
                    });

                    updatedData.imageUrl = uploadFile.url;
                } catch (error) {
                    return res.status(500).json({
                        error: true,
                        message: "Terjadi kesalahan saat mengunggah gambar ke server",
                    });
                }
            }

            if (Object.keys(updatedData).length === 0) {
                return res.json({
                    error: true,
                    message: "Tidak ada perubahan yang diperbarui",
                });
            }

            const updateCategory = await courseCategory.update({
                where: {
                    id: parseInt(categoryId),
                },
                data: updatedData,
            });

            return res.status(201).json({
                success: true,
                message: "Kategori Berhasil diedit",
                response: updateCategory,
            });
        } catch (error) {
            console.error("Error updating payment method: ", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
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
                message: "Level Berhasil Dibuat",
                response: addLevel,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    },
    updateLevel: async(req, res) => {
        try {
            const { levelId } = req.params;
            const { level_name } = req.body;
            if (!level_name) {
                res.status(400).send("Level is Missing");
                return;
            }

            const updateLevel = await courseLevel.update({
                where: {
                    id: parseInt(levelId),
                },
                data: {
                    levelName: level_name,
                },
            });
            return res.status(201).json({
                error: false,
                message: "Level kursus berhasil diedit",
                response: updateLevel,
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
                message: "Tipe Berhasil Dibuat",
                response: addType,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    },
    updateType: async(req, res) => {
        try {
            const { typeId } = req.params;
            const { type_name } = req.body;
            if (!type_name) {
                res.status(400).send("Type is Missing");
                return;
            }

            const updateType = await courseType.update({
                where: {
                    id: parseInt(typeId),
                },
                data: {
                    typeName: type_name,
                },
            });
            return res.status(201).json({
                error: false,
                message: "Jenis kursus berhasil diedit",
                response: updateType,
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
                    studentCount: parseInt(student_count),
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
                message: "Kursus Berhasil Dibuat",
                response: {...addCourse, price: priceInt },
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    },
    updateCourse: async(req, res) => {
        const courseId = parseInt(req.params.courseId);
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
            // Get the logged-in admin ID from the session
            const jwtAdminId = res.sessionLogin.id;

            // Check if the admin exists
            const existingUser = await admin.findUniqueOrThrow({
                where: { id: jwtAdminId },
            });

            if (!existingUser) {
                return res
                    .status(404)
                    .json({ error: true, message: "Admin Tidak Ditemukan" });
            }

            // Check if the course exists
            const existingCourse = await course.findUnique({
                where: { id: courseId },
            });

            if (!existingCourse) {
                return res
                    .status(404)
                    .json({ error: true, message: "Kursus Tidak Ditemukan" });
            }

            // Check if the logged-in admin is the owner of the course
            if (existingCourse.adminId !== jwtAdminId) {
                return res.status(403).json({
                    error: true,
                    message: "Anda tidak berwenang memperbarui kursus ini.",
                });
            }

            // Update the course
            const updatedCourse = await course.update({
                where: { id: courseId },
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
                },
            });

            const priceInt = parseInt(price);
            return res.status(200).json({
                error: false,
                message: "Kursus Berhasil Diperbarui",
                response: {...updatedCourse, price: priceInt },
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ error: true, message: "Internal Server Error" });
        }
    },
    deleteCourse: async(req, res) => {
        const courseId = parseInt(req.params.courseId);

        try {
            // Get the logged-in admin ID from the session
            const jwtAdminId = res.sessionLogin.id;

            // Check if the admin exists
            const existingUser = await admin.findUniqueOrThrow({
                where: { id: jwtAdminId },
            });

            if (!existingUser) {
                return res
                    .status(404)
                    .json({ error: true, message: "Admin Tidak Ditemukan" });
            }

            // Check if the course exists
            const existingCourse = await course.findUnique({
                where: { id: courseId },
            });

            if (!existingCourse) {
                return res
                    .status(404)
                    .json({ error: true, message: "Kursus Tidak Ditemukan" });
            }

            // Check if the logged-in admin is the owner of the course
            if (existingCourse.adminId !== jwtAdminId) {
                return res.status(403).json({
                    error: true,
                    message: "Anda tidak berwenang memperbarui kursus ini.",
                });
            }

            // Delete the course
            await course.delete({ where: { id: courseId } });

            return res.status(200).json({
                error: false,
                message: "Kursus Berhasil Dihapus",
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
            const { content_title, video_link, status } = req.body;
            const checkAdminExist = await admin.findUniqueOrThrow({
                where: { id: jwtAdminId },
            });

            if (!checkAdminExist) {
                return res
                    .status(404)
                    .json({ error: true, message: "Adminnya tidak ditemukan" });
            }

            if (status == null) {
                status = "Active";
            }

            const addCourseContent = await courseContent.create({
                data: {
                    courseId: parseInt(courseId),
                    contentTitle: content_title,
                    videoLink: video_link,
                    status: status,
                },
            });

            return res.status(201).json({
                error: false,
                message: "Konten kursus berhasil dibuat",
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
                    .json({ error: true, message: "Admin tidak ditemukan" });
            }

            const addCourseSkill = await courseSkill.create({
                data: {
                    courseId: parseInt(courseId),
                    skillName: skill_name,
                },
            });

            return res.status(201).json({
                error: false,
                message: "Keterampilan kursus berhasil dibuat",
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
                    .json({ error: true, message: "Admin tidak ditemukan" });
            }

            const addCourseTarget = await courseTarget.create({
                data: {
                    courseId: parseInt(courseId),
                    description: description,
                },
            });

            return res.status(201).json({
                error: false,
                message: "Target kursus berhasil dibuat",
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
                    .json({ error: true, message: "Admin tidak ditemukan" });
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
                message: "Kupon kursus berhasil dibuat",
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

    allCourseOwned: async(req, res) => {
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
                    studentCount: true,
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

            // Convert BigInt to string before sending the response
            const responseData = data.map((course) => ({
                ...course,
                userCount: course.studentCount,
                thumbnailCourse: course.imageUrl,
                price: course.price ? parseFloat(course.price) : null,
                courseType: course.CourseType.typeName,
                courseCategory: course.CourseCategory.categoryName,
                courseLevel: course.CourseLevel.levelName,
            }));

            const myCourseCount = responseData.length;

            responseData.forEach((course) => {
                delete course.userCourseContent;
                delete course.CourseType;
                delete course.CourseCategory;
                delete course.CourseLevel;
                delete course.studentCount;
                delete course.imageUrl;
            });

            return res.status(200).json({
                error: false,
                message: "Memuat kursus berhasil",
                response: {
                    adminId: jwtAdminId,
                    totalCourse: myCourseCount,
                    myCourse: responseData,
                },
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: true,
                message: error || "Internal server error",
            });
        }
    },
};