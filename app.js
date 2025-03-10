const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const { courseRouter } = require('./routes/course.js');
const { userMiddleware } = require('./middleware/user.js')
const { adminMiddleware } = require('./middleware/admin.js')
const { userRouter, userVerifiedRouter } = require('./routes/user.js')
const { adminRouter, adminVerifiedRouter } = require('./routes/admin.js')

const app = express();
app.use(express.json());
app.use(cookieParser());
require('dotenv').config();

// user routes 
app.use('/user', userRouter);
app.use('/api/v1/user', userMiddleware, userVerifiedRouter);

// admin routes
app.use('/admin', adminRouter);
app.use('/api/v1/admin', adminMiddleware, adminVerifiedRouter);

// course routes
app.use('/api/v1/course', courseRouter);
    
async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        app.listen(3000)
        console.log('App listening on port 3000');
    } catch (err) {
        console.log(err.message)
    }
}

main()