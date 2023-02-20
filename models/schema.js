const mongoose = require("mongoose")

const info = mongoose.Schema({
    "topic" : String,
    "question" : String,
    "optionA" : String,
    "optionB" : String,
    "optionC" : String,
    "optionD" : String,
    "answer"  : String
})

const infoModel = mongoose.model("Info",info)

module.exports = {infoModel}