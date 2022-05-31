const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    task : Number,
    todo : String
})

const schema = new mongoose.Schema({
    formData : [formSchema],
    userId : Number,
    username : String
})

const model = mongoose.model('info', schema)

module.exports = model;