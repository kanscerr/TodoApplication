const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    task : Number,
    todo : String,
    isDeleted : Number
})

const schema = new mongoose.Schema({
    formData : [formSchema],
    userId : Number,
    username : String
})

const model = mongoose.model('todos', schema)

module.exports = model;