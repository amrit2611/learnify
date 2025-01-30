const { Router } = require('express');
const { adminModel, courseModel } = require('../db')
const { adminMiddleware } = require('../middleware/admin')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const bcrypt = require('bcrypt')


const adminRouter = Router();
require('dotenv').config();


adminRouter.post('/signup', async (req, res) => {
    // input validation here
    const { email, password, firstName, lastName } = req.body
    // bcrypt here
    try {
        const newAdmin = await adminModel.create({
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        })
        return res.status(200).json({
            message: "Admin created!!",
            adminId: newAdmin._id,
        })
    } catch (err) {
        console.log(`error while creating new admin: ${err.message}`);
        return res.status(500).json({
            message: "error while creating new admin",
            error: err.message
        })
    }
})


adminRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const currentAdmin = await adminModel.findOne({
        email: email,
        password: password,
    })
    if (currentAdmin) {
        const token = jwt.sign({
            id: currentAdmin._id,
        }, process.env.JWT_ADMINSECRET)
        res.status(200).json({
            message: "Admin found",
            token: token
        });
    } else {
        res.status(403).json({
            message: "Invalid Credentials"
        })
    }
})


adminRouter.post('/course', adminMiddleware, async (req, res) => {
    console.log('post-course route');
    const adminId = req.adminId;
    const { title, description, price, imageUrl } = req.body;
    // instead of taking imageUrl, we need to take actual images and upload somewhere.
    // there should be input validation here since we are creating new doc in db.
    try {
        const currentCourse = await courseModel.create({
            title: title,
            description: description,
            price: price,
            imageUrl: imageUrl,
            creatorId: adminId
        })
        return res.status(200).json({
            message: "Course Created",
            courseId: currentCourse._id
        })
    } catch (err) {
        console.log(`error while creating course: ${err.message}`);
        return res.status(500).json({
            message: "error while creating new course",
            error: err.message
        })
    }
})


adminRouter.put('/course', adminMiddleware, async (req, res) => {
    console.log('put-course route');
    const adminId = req.adminId;
    const courseId = req.courseId;
    const { newTitle, newDescription, newPrice, newImageUrl } = req.body;

    const currentCourse = await courseModel.findByIdAndUpdate(courseId, {
        title: newTitle,
        description: newDescription,
        price: newPrice,
        imageUrl: newImageUrl
    }, { new: true })
    res.status(200).json({
        message: "Course updated",
        courseId: currentCourse._id
    })
})


adminRouter.get('/course', async (req, res) => {
    console.log("get-course route");
    const adminId = req.adminId;
    const courseId = req.courseId;
    const currentCourse = await courseModel.findOne({
        _id: courseId,
        creatorId: adminId
    })
    if (currentCourse) { 
        res.status(200).send(currentCourse)
    } else { 
        res.json({
            message: "Course Unavailable",
        })
    }
})


module.exports = { adminRouter: adminRouter }