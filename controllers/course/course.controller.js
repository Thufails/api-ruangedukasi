const { course, courseContent } = require("../../models");

const allCourse = async (req, res) => {
  try {
    const data = await course.findMany({
      orderBy: {
        id: "asc",
      },
    });

    // Convert BigInt to string before sending the response
    const serializedData = data.map((course) => ({
      ...course,
      price: course.price ? parseFloat(course.price) : null,
    }));

    return res.status(200).json({
      error: false,
      message: "Load course successful",
      response: serializedData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

const detailCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId; // params courseId from course.route
    const data = await course.findFirst({
      where: {
        id: parseInt(courseId),
      },
      orderBy: {
        id: "asc",
      },
      include: {
        courseContent: {
          select: {
            id: true,
            contentTitle: true,
            videoLink: true,
            status: true,
          },
        },
      },
    });

    if (!data) {
      // Handle where no course is found with the given courseId
      return res.status(404).json({
        error: true,
        message: `Course with id #${courseId} not found`,
        response: null,
      });
    }

    // Convert BigInt to floeat before sending the response
    const serializedData = {
      ...data,
      price: data.price ? parseFloat(data.price) : null,
    };

    return res.status(200).json({
      error: false,
      message: `Load course with id #${courseId} successful`,
      response: serializedData,
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
  allCourse,
  detailCourse,
};
