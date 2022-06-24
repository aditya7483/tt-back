const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },

    title:{
        type:String,
        required:true
    },

    description:{
        type:String
    },

    date:{
        type:Date,
        default: Date.now
    }
})

module.exports = mongoose.model('notes',noteSchema);