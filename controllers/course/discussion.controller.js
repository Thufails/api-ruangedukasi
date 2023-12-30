const { Discussion } = require("../../models");

module.exports = {
    getCourseDiscussions: async (req, res) => {  
        try {
            const courseId = req.params.courseId;

            const discussions = await Discussion.findMany({
                where: {
                courseId: courseId,
                },
                include: {
                User: {
                    select: {
                    id: true,
                    fullName: true,
                    imageUrl: true,
                    },
                },
                replies: {
                    include: {
                    User: {
                        select: {
                        id: true,
                        fullName: true,
                        imageUrl: true,
                        },
                    },
                    },
                },
                },
            });

            res.json({
                discussions,
            });
            } catch (error) {
            console.error("Error getting course discussions:", error);
            res.status(500).json({ message: "Internal Server Error" });
            }
        },

    addDiscussionComment: async (req, res) => {  
        try {
            const userId = req.user.id; 
            const courseId = req.params.courseId;
            const { comment } = req.body;

            const newComment = await Discussion.create({
                data: {
                courseId: courseId,
                userId: userId,
                comment: comment,
                },
            });

            res.json({
                newComment,
            });
            } catch (error) {
            console.error("Error adding discussion comment:", error);
            res.status(500).json({ message: "Internal Server Error" });
            }
        },

    addReplyToComment: async (req, res) => { 
        try {
            const userId = req.user.id; 
            const commentId = req.params.commentId;
            const { reply } = req.body;

            const newReply = await Discussion.create({
                data: {
                parentId: commentId,
                userId: userId,
                comment: reply,
                },
        });

        res.json({
            newReply,
        });
        } catch (error) {
        console.error("Error adding reply:", error);
        res.status(500).json({ message: "Internal Server Error" });
        }
    },
};