const { Router } = require('express')
const { purchaseModel, courseModel, userModel } = require('../db')
const { userMiddleware } = require('../middleware/user')
const courseRouter = Router();


// purchase courses
courseRouter.post('/purchase', userMiddleware, async (req,res) => {
    const userId = req.userId;
    if (!userId || userId === undefined || userId === null) {
        return res.status(401).json({
            message: "you need to sign in to continue"
        })
    }
    const courseId = req.body.courseId;
    if (!courseId || courseId === undefined || courseId === null) {
        return res.status(400).json({
            message: "select a course to proceed"
        })
    }
    // here we should check if user has paid the price
    try { 
        const newPurchase = await purchaseModel.create({
            userId, courseId
        });
        await userModel.updateOne({
            _id: userId
        }, {
            '$push': {
                purchasesCourses: courseId,
            } 
        })
        return res.status(200).json({
            message: "purchase successful"
        })
    } catch (err) {
        return res.status(500).json({
            message: "error while purchasing course",
            error: err.message
        })
    }
})


courseRouter.get('/preview', async (req,res) => { 
    // does not need to be authenticated since all should see preview
    try {
        const courses = await courseModel.find({});
        return res.status(200).json({
            message: "fetched all available courses",
            courses
        })
    } catch (err) {
        return res.status(500).json({
            message: "error while fetching courses",
            error: err.message
        })
    }
})


module.exports = { courseRouter: courseRouter }