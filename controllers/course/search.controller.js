const { course, courseContent } = require("../../models");
const { allCourse } = require("./course.controller");

const searchCourse = async(req, res) => {
    try {
        const courseSearchParams = req.query.course; // course is query params key
        const data = await course.findMany({
            where: {
                courseName: {
                    contains: courseSearchParams,
                    mode: "insensitive",
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
            price: course.price ? parseFloat(course.price) : null,
            courseType: course.CourseType.typeName,
            courseCategory: course.CourseCategory.categoryName,
            courseLevel: course.CourseLevel.levelName,
        }));

        responseData.forEach((course) => {
            delete course.CourseType;
            delete course.CourseCategory;
            delete course.CourseLevel;
        });

        const responseDataLength = responseData.length;
        if (responseDataLength !== 0) {
            return res.status(200).json({
                error: false,
                message: `Memuat kursus dengan query "${courseSearchParams}" berhasil`,
                response: responseData,
            });
        }

        return res.status(404).json({
            error: false,
            message: `Kursus dengan query "${courseSearchParams}" tidak ditemukan`,
            response: null,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
};

const searchMultiCourse = async(req, res) => {
    try {
        const catSearchParams = req.query.catId;
        const levelSearchParams = req.query.levelId;
        const typeSearchParams = req.query.typeId;

        if (!catSearchParams && !levelSearchParams && !typeSearchParams) {
            return allCourse(req, res);
        }

        const categorySearchArray = Array.isArray(catSearchParams) ?
            catSearchParams.map(Number) : [Number(catSearchParams)];

        const levelSearchArray = Array.isArray(levelSearchParams) ?
            levelSearchParams.map(Number) : [Number(levelSearchParams)];

        const typeSearchArray = Array.isArray(typeSearchParams) ?
            typeSearchParams.map(Number) : [Number(typeSearchParams)];

        const data = await course.findMany({
            where: {
                AND: [
                    // Category search
                    catSearchParams ? {
                        courseCategoryId: { in: categorySearchArray,
                        },
                    } :
                    null,

                    // Level search
                    levelSearchParams ? {
                        courseLevelId: { in: levelSearchArray,
                        },
                    } :
                    null,

                    // Type search
                    typeSearchParams ? {
                        courseTypeId: { in: typeSearchArray,
                        },
                    } :
                    null,
                ].filter(Boolean),
            },
            orderBy: {
                id: "asc",
            },
            select: {
                id: true,
                instructorName: true,
                courseName: true,
                courseDescription: true,
                price: true,
                rating: true,
                imageUrl: true,
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
            userCount: course.userCourseContent.length,
            thumbnailCourse: course.imageUrl,
            price: course.price ? parseFloat(course.price) : null,
            courseType: course.CourseType.typeName,
            courseCategory: course.CourseCategory.categoryName,
            courseLevel: course.CourseLevel.levelName,
        }));

        responseData.forEach((course) => {
            delete course.userCourseContent;
            delete course.CourseType;
            delete course.CourseCategory;
            delete course.CourseLevel;
            delete course.imageUrl;
        });

        const responseDataLength = responseData.length;
        if (responseDataLength !== 0) {
            return res.status(200).json({
                error: false,
                message: `Muat kursus dengan pencarian multi berhasil`,
                response: responseData,
            });
        }

        return res.status(404).json({
            error: false,
            message: `Kursus dengan query "catId:${categorySearchArray}, levelId:${levelSearchArray} typeId:${typeSearchArray}" tidak ditemukan`,
            response: null,
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
    searchCourse,
    searchMultiCourse,
};