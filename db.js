const mongoose = require('mongoose');
const { Schema } = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
require('dotenv').config();


const userSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true},
    firstName: String,
    lastName: String,
})


const adminSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true},
    firstName: String,
    lastName: String,
})


const courseSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    creatorId: mongoose.Schema.Types.ObjectId,
})


const purchaseSchema = new Schema({
    userId: mongoose.Schema.Types.ObjectId,
    courseId: mongoose.Schema.Types.ObjectId,
})


const userModel = mongoose.model('user', userSchema)
const adminModel = mongoose.model('admin', adminSchema)
const courseModel = mongoose.model('course', courseSchema)
const purchaseModel = mongoose.model('purchase', purchaseSchema)


module.exports = { userModel, adminModel, courseModel, purchaseModel }