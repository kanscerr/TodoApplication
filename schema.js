const mongoose = require('mongoose');
const { stringify } = require('querystring');

const formSchema = new mongoose.Schema({
    taskNumber : Number,
    todo : String,
    isDeleted : Boolean
})

const schema = new mongoose.Schema({
    userInfo : {username : String, email : String, password : String},
    actionInfo : {action_id : String},
    formData : [formSchema],
    sessionData : {userid : Number},
    userId : Number
})

const model = mongoose.model('todos', schema)

module.exports = model;