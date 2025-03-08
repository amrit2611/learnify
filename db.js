const { Schema } = require('mongoose')
const mongoose = require('mongoose');


const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    purchasedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})


const adminSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    createdCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})


const courseSchema = new Schema({
    title: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        unique: true,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imageUrl: String,
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    }
})


const purchaseSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'
    },
    purchasedAt: {
        type: Date,
        default: Date.now(),
    }
})


// should also have a model for course content for each and every course.


const userModel = mongoose.model('user', userSchema)
const adminModel = mongoose.model('admin', adminSchema)
const courseModel = mongoose.model('course', courseSchema)
const purchaseModel = mongoose.model('purchase', purchaseSchema)


module.exports = { userModel, adminModel, courseModel, purchaseModel }