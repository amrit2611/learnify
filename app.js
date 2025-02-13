const express = require('express')
const mongoose = require('mongoose')
const { userRouter } = require('./routes/user.js')
const { courseRouter } = require('./routes/course.js')
const { adminRouter } = require('./routes/admin.js')

require('dotenv').config();
const app = express();
app.use(express.json())

app.use('/api/v1/user', userRouter);
app.use('/api/v1/course', courseRouter);
app.use('/api/v1/admin', adminRouter);

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