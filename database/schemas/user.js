const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },

    email:{
        type:String,
        unique:true,
        required:true,
    },

    isAdmin:{
        type:Boolean,
        default:false
    },

    password:{
        type:String,
        required:true,
    }
    
})

const User = mongoose.model('user',userSchema)
User.createIndexes()

module.exports = User;