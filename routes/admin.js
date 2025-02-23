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
        firstName: z.string().min(3).max(100),
        lastName: z.string().min(3).max(100)
    })
    const parsedDataWithSuccess = requiredBody.partial().safeParse(req.body);
    console.log(parsedDataWithSuccess)
    if (!parsedDataWithSuccess) {
        return res.json({
            message: "incorrect format",
            error: parsedDataWithSuccess.error
        });
    } else {
        try {
            const { email, password, firstName, lastName } = req.body
            const alreadyAdmin = await adminModel.findOne({
                email: email
            })
            if (alreadyAdmin) {
                return res.status(422).json({
                    message: "admin already exists, proceed to login"
                })
            }
            const hashedPassword = await bcrypt.hash(password, 11)
            const newAdmin = await adminModel.create({
                email: email,
                password: hashedPassword,
                firstName: firstName,
                lastName: lastName
            })
            console.log(`admin created: ${newAdmin._id}`)
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
    }
})


adminRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "email or password is missing"
        })
    }
    try {
        const admin = await adminModel.findOne({
            email: email,
        })
        if (!admin) {
            return res.status(403).json({
                message: "invalid credentials"
            })
        }
        const passwordMatched = bcrypt.compare(password, admin.password);
        if (passwordMatched) {
            console.log(`password matched: ${admin.password}`)
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
                message: "successfully signed in"
            })
        } else {
            return res.status(403).json({
                error: "invalid credentials"
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: "error while signing in",
            error: err.message
        })
    }
})


adminVerifiedRouter.post('/course', async (req, res) => {
    console.log('post-course route');
    const adminId = req.adminId;
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


adminVerifiedRouter.put('/course', async (req, res) => {
    console.log('put-course route');
    const adminId = req.adminId;
    const courseId = req.courseId;
    const { newTitle, newDescription, newPrice, newImageUrl } = req.body;
    // input validation here 
    const currentCourse = await courseModel.findOneAndUpdate({
        _id: courseId,
        creatorId: adminId,
    }, {
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


adminVerifiedRouter.post('/logout', async (req, res) => {
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


adminRouter.get('/course/bulk', async (req, res) => {
    console.log("get-course/bulk route");
    const adminId = req.adminId;
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