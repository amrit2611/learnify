const { Router } = require('express')
const { userModel, purchaseModel, courseModel } = require('../db')
const { userMiddleware } = require('../middleware/user')
const userRouter = Router();
const jwt = require('jsonwebtoken')
const { z } = require('zod')


require('dotenv').config();
const JWT_USERSECRET = process.env.JWT_USERSECRET


userRouter.post('/signup', async (req, res) => {
    // input validation here
    const { email, password, firstName, lastName } = req.body;
    // bcrypt goes here
    try {
        const newUser = await userModel.create({
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
        })
        return res.status(200).json({
            message: "User Created !!",
            userId: newUser._id,
        })
    } catch (err) {
        return res.status(500).json({
            message: "error while creating new user",
            error: err.message
        })
    }
})


// have to also implement validation using zod and hashing, salting using bcrypt.
userRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await userModel.findOne({
            email: email,
            password: password,
        })
        if (user) {
            // have to add cookie login here
            const token = jwt.sign({
                id: user._id
            }, JWT_USERSECRET);
            return res.status(200).json({
                message: "User found",
                token: token
            })
        } else {
            return res.status(403).json({
                message: "Invalid Credentials",
            })
        }
    } catch (err) {
        return res.status(500).json({
            message: "error while signing you in",
            error: err.message
        })
    }
})


// return purchased courses for this user
userRouter.get('/courses', userMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        const user = await userModel.findOne({
            _id: userId
        })
        const courses = await courseModel.find({
            _id: {
                '$in': user.purchasesCourses
            }
        })
        return res.status(200).json({
            message: "successfully fetched your purchased courses",
            courses
        })
    } catch (err) {
        return res.json({
            message: "error fetching your purchased courses",
            error: err.message
        })
    }
})


module.exports = { userRouter: userRouter }