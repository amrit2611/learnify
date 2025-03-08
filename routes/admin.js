const { Router } = require('express');
const { adminModel, courseModel } = require('../db')
const { adminMiddleware } = require('../middleware/admin')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const bcrypt = require('bcrypt');


const adminRouter = Router();
const adminVerifiedRouter = Router();
require('dotenv').config();
const ADMIN_ACCESS = process.env.JWT_ADMINSECRET


adminRouter.post('/signup', async (req, res) => {
    const requiredBody = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(6).max(100),
        username: z.string().min(3).max(100)
    })
    const parsedDataWithSuccess = requiredBody.safeParse(req.body);
    console.log(parsedDataWithSuccess)
    if (!parsedDataWithSuccess) {
        return res.json({
            message: "incorrect format",
            error: parsedDataWithSuccess.error
        });
    } else {
        try {
            const { email, password, username } = req.body;
            const alreadyAdmin = await adminModel.findOne({
                $or: [
                    { email: email },
                    { username: username }
                ]
            })
            if (alreadyAdmin) {
                return res.status(422).json({
                    message: "admin already exists, proceed to login"
                })
            }
            const hashedPassword = await bcrypt.hash(password, 11)
            await adminModel.create({
                email: email,
                password: hashedPassword,
                username: username
            })
            return res.status(200).json({
                message: "admin created, proceed to login",
            })
        } catch (err) {
            return res.status(500).json({
                message: "error while creating new admin",
                error: err.message
            })
        }
    }
})


adminRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            error: "both email and password are required to sign you in"
        })
    }
    try {
        const admin = await adminModel.findOne({
            email: email,
        })
        if (!admin) {
            return res.status(403).json({
                error: "create an account to continue"
            })
        }
        const passwordMatched = bcrypt.compare(password, admin.password);
        if (!passwordMatched) {
            return res.status(403).json({
                error: "provide valid credentials to continue"
            });
        } else {
            const token = jwt.sign({
                id: admin._id
            }, ADMIN_ACCESS, {
                expiresIn: '1h'
            });
            res.cookie('admin_access', token, {
                httpOnly: true,
                sameSite: 'Strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 60 * 1000,
                path: '/'
            });
            return res.status(200).json({
                message: "welcome to your Learnify!"
            })
        }
    } catch (err) {
        return res.status(500).json({
            message: "error while signing you in",
            error: err.message
        })
    }
})


// create course route
adminVerifiedRouter.post('/course', async (req, res) => {
    const adminId = req.adminId;
    if (!adminId || adminId === undefined || adminId === null) {
        return res.status(401).json({
            error: "you need to sign in to continue"
        })
    }
    const { title, description, price, imageUrl } = req.body;
    // instead of taking imageUrl, we need to take actual images and upload somewhere.
    // input validation here
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
        })
    } catch (err) {
        return res.status(500).json({
            message: "error while creating new course",
            error: err.message
        })
    }
})


// updating existing course
adminVerifiedRouter.put('/course', async (req, res) => {
    const adminId = req.adminId;
    if (!adminId || adminId === undefined || adminId === null) {
        return res.status(401).json({
            error: "you need to sign in to continue"
        })
    }
    const courseId = req.courseId;
    if (!courseId || courseId === undefined || courseId === null) {
        return res.status(401).json({
            error: "select a course and continue"
        })
    }
    try {
        const { newTitle, newDescription, newPrice, newImageUrl } = req.body;
        // input validation here 
        const currentCourse = await courseModel.findOneAndUpdate({
            _id: courseId,
            creatorId: adminId,
        }, {
            title: newTitle,
            description: newDescription,
            price: newPrice,
            imageUrl: newImageUrl,
            lastUpdated: Date.now,
        }, { new: true })
        res.status(200).json({
            message: "Course updated",
            courseId: currentCourse._id
        })
    } catch (err) {
        return res.status(500).json({
            message: "error while updating course",
            error: err.message
        })
    }
})


adminVerifiedRouter.post('/logout', async (req, res) => {
    const adminId = req.adminId;
    if (!adminId || adminId === undefined || adminId === null) {
        return res.status(401).json({
            error: "you need to sign in to continue"
        })
    }
    try {
        res.clearCookie('admin_access');
        return res.status(200).json({
            message: "logged out successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: "error while logging out",
            error: err.message
        })
    }
})


// all courses for this admin
adminRouter.get('/course/bulk', async (req, res) => {
    const adminId = req.adminId;
    if (!adminId || adminId === undefined || adminId === null) {
        return res.status(401).json({
            error: "you need to sign in to continue"
        })
    }
    try {
        const courses = await courseModel.find({
            creatorId: adminId
        });
        return res.status(200).json({
            message: "successfully fetched courses for this admin",
            courses: courses
        })
    } catch (err) {
        return res.status(500).json({
            message: "error fetching courses",
            err: err.message
        })
    }
})


module.exports = {
    adminRouter: adminRouter,
    adminVerifiedRouter: adminVerifiedRouter
}