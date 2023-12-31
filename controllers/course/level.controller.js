const { courseLevel } = require("../../models");

const allLevel = async(req, res) => {
    try {
        const data = await courseLevel.findMany({
            orderBy: {
                id: "asc",
            },
            select: {
                id: true,
                levelName: true,
            },
        });

        return res.status(200).json({
            error: false,
            message: "Memuat level kursus berhasil",
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
    allLevel,
};