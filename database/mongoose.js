const mongoose = require('mongoose');
require('dotenv').config();
let user = process.env.USER_ID;
let key = process.env.USER_KEY;

const mongoURI = `mongodb+srv://${user}:${key}@cluster0.a1jux.mongodb.net/tabletennis?retryWrites=true&w=majority`
// const mongoURI = process.env.MONGO_URI
const connectToMongo = () => {
    mongoose.connect(mongoURI, () => {
        console.log("Connected to Mongo Successfully");
    })
}
module.exports = connectToMongo;