const uploadController = {
    uploadSingle: (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: "Fayl tanlanmadi!" });
            }

            const fileUrl = `/uploads/${req.file.filename}`;
            res.json({
                success: true,
                message: "Fayl muvaffaqiyatli yuklandi!",
                filename: req.file.filename,
                url: fileUrl,
                size: req.file.size,
                mimetype: req.file.mimetype
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = uploadController;
