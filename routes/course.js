const { Router } = require('express')
const { purchaseModel, courseModel } = require('../db')
const { userMiddleware } = require('../middleware/user')
const courseRouter = Router();


courseRouter.post('/purchase', userMiddleware, async (req,res) => {
    const userId = req.userId;
    const courseId = req.body.courseId;
    // here we should check if user has paid the price
    try { 
        const newPurchase = await purchaseModel.create({
            userId, courseId
        })
        return res.status(200).json({
            message: "purchase successful",
            purchaseId: newPurchase._id
        })
    } catch (err) {

    }
})


courseRouter.get('/preview', async (req,res) => {
    // does not need to be authenticated since all should see preview
    try {
        const courses = await courseModel.find({});
        return res.status(200).json({
            message: "fetched all courses",
            courses
        })
    } catch (err) {
        return res.status(500).json({
            message: "error while fetching courses",
            err: err.message
        })
    }
})


module.exports = { courseRouter: courseRouter }