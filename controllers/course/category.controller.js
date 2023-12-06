const { courseCategory } = require("../../models");

const allCategory = async (req, res) => {
  try {
    const data = await courseCategory.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        categoryName: true,
        imageUrl: true,
      },
    });

    return res.status(200).json({
      error: false,
      message: "Load course category successful",
      response: data,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error,
    });
  }
};

module.exports = {
  allCategory,
};
