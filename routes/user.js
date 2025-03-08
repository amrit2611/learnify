const { userModel, purchaseModel, courseModel } = require('../db')
const { Router } = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { z } = require('zod')


const userRouter = Router();
const userVerifiedRouter = Router();
require('dotenv').config();
const ACCESS = process.env.JWT_USERSECRET


userRouter.post('/signup', async (req, res) => {
    const requiredBody = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(6).max(100),
        username: z.string().min(3).max(100)
    })
    const parsedDataWithSuccess = requiredBody.safeParse(req.body);
    if (!parsedDataWithSuccess) {
        return res.json({
            message: "incorrect format",
            error: parsedDataWithSuccess.error
        });
    } else {
        try {
            const email = req.body.email;
            const username = req.body.email;

            const alreadyUser = await userModel.findOne({
                $or: [
                    { email: email },
                    { username: username }
                ]
            });
            if (alreadyUser) {
                return res.status(422).json({
                    message: "user already exists, proceed to login"
                })
            }

            const password = req.body.password;
            const hashedPassword = await bcrypt.hash(password, 11)
            const newUser = await userModel.create({
                email: email,
                password: hashedPassword,
                username: username
            })
            return res.status(200).json({
                message: "user created, proceed to login",
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
            message: "both email and password are required to sign you in",
        })
    }
    try {
        const user = await userModel.findOne({
            email: email,
        })
        if (!user) {
            return res.status(403).json({
                message: "you need to have an account to continue"
            })
        }
        const passwordMatched = bcrypt.compare(password, user.password);
        if (!passwordMatched) {
            return res.status(403).json({
                message: "provide accurate credentials to continue"
            });
        } else {
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
                message: "welcome to Learnify"
            })
        }
    } catch (err) {
        return res.status(500).json({
            message: "error while signing you in",
            error: err.message
        })
    }
})


// return all purchased courses for this user
userVerifiedRouter.get('/courses', async (req, res) => {
    const userId = req.userId;
    if (!userId || userId === undefined || userId === null) {
        return res.status(401).json({
            message: "you need to sign in to continue"
        })
    }
    try {
        const user = await userModel.findOne({
            _id: userId
        })
        const courses = await courseModel.find({
            _id: {
                '$in': user.purchasedCourses
            }
        })
        return res.status(200).json({
            message: "here are your purchased courses",
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
    if (!userId || userId === undefined || userId === null) {
        return res.status(401).json({
            message: "you need to sign in to continue"
        })
    }
    try {
        res.clearCookie('access');
        return res.status(200).json({
            message: "logged out successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: "error while logging out",
            error: err.message
        })
    }
});


module.exports = {
    userRouter: userRouter,
    userVerifiedRouter: userVerifiedRouter,
}