const { courseReview, course } = require("../../models");

module.exports = {
  getCourseReviews: async (req, res) => {
    try {
      const courseId = req.params.courseId;

      const data = await courseReview.findMany({
        where: {
          courseId: parseInt(courseId),
        },
        include: {
          User: {
            select: {
              id: true,
              fullName: true,
              imageUrl: true,
            },
          },
        },
      });

      if (data.length == 0) {
        return res.status(200).json({
          error: false,
          message: "Review and rating data not available for this course",
        });
      }

      return res.status(200).json({
        error: false,
        message: "Load course reviews successfully",
        response: data,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  },

  addCourseReview: async (req, res) => {
    try {
      const jwtUserId = res.sessionLogin.id; // From checktoken middlewares
      const courseId = parseInt(req.params.courseId);
      const { rating, review } = req.body;

      // Check already review
      const checkAlreadyReview = await courseReview.count({
        where: {
          userId: jwtUserId,
        },
      });

      if (checkAlreadyReview != 0) {
        return res.status(200).json({
          error: false,
          message: "Already reviewed and rated in this course",
        });
      }

      // Check rating now in course table
      const checkRatingCourse = await course.findFirst({
        where: {
          id: courseId,
        },
        select: {
          rating: true,
        },
      });

      // Check sum rating in review table
      const checkSumRating = await courseReview.aggregate({
        _sum: {
          rating: true,
        },
        where: {
          courseId: courseId,
        },
      });
      const totalRating = checkSumRating._sum.rating;

      // Check count review in review table
      const checkCountReview = await courseReview.count({
        where: {
          courseId: courseId,
        },
      });

      const data = await courseReview.create({
        data: {
          courseId: courseId,
          userId: jwtUserId,
          rating: parseInt(rating),
          review: review,
        },
      });

      const nowRating = checkRatingCourse.rating;
      const newRating = data.rating;

      if (nowRating == null || nowRating == 0) {
        averageRating = newRating;
      } else {
        averageRating = totalRating / checkCountReview;
      }

      // Format one digit after decimal
      averageRating = parseFloat(averageRating.toFixed(2));

      // Update rating in course table
      await course.update({
        where: {
          id: courseId,
        },
        data: {
          rating: averageRating,
        },
      });

      return res.status(201).json({
        error: false,
        message: "Review and rating added successfully",
        response: data,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  },
};
