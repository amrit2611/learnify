const { userModel, purchaseModel, courseModel } = require('../db')
const { Router } = require('express')
const jwt = require('jsonwebtoken')
const bcrpt = require('bcrypt')
const { z } = require('zod')


const userRouter = Router();
const userVerifiedRouter = Router();
require('dotenv').config();
const ACCESS = process.env.JWT_USERSECRET


userRouter.post('/signup', async (req, res) => {
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
            const email = req.body.email;
            const alreadyUser = await userModel.findOne({
                email: email
            })
            if (alreadyUser) {
                return res.status(422).json({
                    message: "user already exists, proceed to login"
                })
            }
            const password = req.body.password;
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const hashedPassword = await bcrpt.hash(password, 11)
            const newUser = await userModel.create({
                email: email,
                password: hashedPassword,
                firstName: firstName,
                lastName: lastName,
            })
            console.log(`user created: ${newUser._id}`)
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
    }
})


userRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            message: "both email and password are required",
        })
    }
    try {
        const user = await userModel.findOne({
            email: email,
        })
        if (!user) {
            return res.status(403).json({
                message: "invalid credentials"
            })
        }
        const passwordMatched = bcrypt.compare(password, user.password);
        if (passwordMatched) {
            console.log(`password matched: ${user.password}`)
            const token = jwt.sign({
                id: user._id
            }, ACCESS, {
                expiresIn: '30m'
            });
            res.cookie('access', token, {
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
                message: "invalid credentials"
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: "error while signing you in",
            error: err.message
        })
    }
})


// return purchased courses for this user
userVerifiedRouter.get('/courses', async (req, res) => {
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

userVerifiedRouter.post('/logout', async (req, res) => {
    const userId = req.userId;
})

module.exports = {
    userRouter: userRouter,
    userVerifiedRouter: userVerifiedRouter,
}