const { coursePPN } = require("../../models");

const addCoursePPN = async(req, res) => {
    try {
        const { ppn } = req.body;
        const cekCount = await coursePPN.count();

        if (cekCount == 0) {
            const data = await coursePPN.create({
                data: {
                    ppn: parseInt(ppn),
                },
            });
            return res.status(201).json({
                error: false,
                message: "PPN Berhasil Ditambahkan",
                response: data,
            });
        }

        return res.status(203).json({
            error: true,
            message: "Data PPN sudah tersedia, silakan perbarui data PPN sebelumnya",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error || "Internal server error",
        });
    }
};

module.exports = {
    addCoursePPN,
};