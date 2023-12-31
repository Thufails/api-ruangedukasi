const { courseType, course } = require("../../models");

const allType = async(req, res) => {
    try {
        const data = await courseType.findMany({
            orderBy: {
                id: "asc",
            },
            select: {
                id: true,
                typeName: true,
            },
        });

        return res.status(200).json({
            error: false,
            message: "Memuat tipe kursus berhasil",
            response: data,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
};
const premiumType = async(req, res) => {
    try {
        const data = await course.findMany({
            where: {
                CourseType: {
                    typeName: "Premium",
                },
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
            },
        });

        // Convert BigInt to string before sending the response
        const responseData = data.map((course) => ({
            ...course,
            thumbnailCourse: course.imageUrl,
            price: course.price ? parseFloat(course.price) : null,
            courseType: course.CourseType.typeName,
            courseCategory: course.CourseCategory.categoryName,
            courseLevel: course.CourseLevel.levelName,
        }));

        responseData.forEach((course) => {
            delete course.CourseType;
            delete course.CourseCategory;
            delete course.CourseLevel;
            delete course.imageUrl;
        });

        return res.status(200).json({
            error: false,
            message: "Memuat kursus premium berhasil",
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

const gratisType = async(req, res) => {
    try {
        const data = await course.findMany({
            where: {
                CourseType: {
                    typeName: "Gratis",
                },
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
            },
        });

        // Convert BigInt to string before sending the response
        const responseData = data.map((course) => ({
            ...course,
            thumbnailCourse: course.imageUrl,
            price: course.price ? parseFloat(course.price) : null,
            courseType: course.CourseType.typeName,
            courseCategory: course.CourseCategory.categoryName,
            courseLevel: course.CourseLevel.levelName,
        }));

        responseData.forEach((course) => {
            delete course.CourseType;
            delete course.CourseCategory;
            delete course.CourseLevel;
            delete course.imageUrl;
        });

        return res.status(200).json({
            error: false,
            message: "Memuat kursus gratis berhasil",
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
    allType,
    premiumType,
    gratisType,
};