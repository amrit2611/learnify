const { Router } = require('express')
const { userModel } = require('../db')
const { userMiddleware } = require('../middleware/user')
const userRouter = Router();
const jwt = require('jsonwebtoken')
const { z } = require('zod')


require('dotenv').config();
const JWT_USERSECRET = process.env.JWT_USERSECRET


userRouter.post('/signup', async (req, res) => {
    // input validation here
    const requiredBody = {
    }
    const { email, password, firstName, lastName } = req.body;
    // bcrypt goes here
    const newUser = await userModel.create({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
    })
    res.status(200).json({
        message: "User Created !!",
        userId: newUser._id,
    })
})


// have to also implement validation using zod and hashing, salting using bcrypt.
userRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body
    const user = await userModel.findOne({
        email: email,
        password: password,
    })
    if (user) {
        // have to add cookie login here
        const token = jwt.sign({
            id: user._id
        }, JWT_USERSECRET);
        res.status(200).json({
            message: "User found",
            token: token
        })
    } else {
        res.status(403).json({
            message: "Invalid Credentials",
        })
    }
})


userRouter.get('/purchases', async (req, res) => {
    res.json({ '': '' })
})


module.exports = { userRouter: userRouter }