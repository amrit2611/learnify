const { Schema } = require('mongoose')
const mongoose = require('mongoose');
require('dotenv').config();


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
    firstName: String,
    lastName: String,
    purchasesCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'
    }]
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
    firstName: String,
    lastName: String,
})


const courseSchema = new Schema({
    title: String,
    description: String,
    price: Number,
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
    }
})


// should also have a model for course content for each and every course.


const userModel = mongoose.model('user', userSchema)
const adminModel = mongoose.model('admin', adminSchema)
const courseModel = mongoose.model('course', courseSchema)
const purchaseModel = mongoose.model('purchase', purchaseSchema)


module.exports = { userModel, adminModel, courseModel, purchaseModel }