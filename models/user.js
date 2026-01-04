const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/mini_project")


const userSchema = mongoose.Schema({
    name : {
        type : String
    },
    username : {
        type : String
    },
    age : Number,
    email : {
        type : String,
        unique : true,
        required : true
    },
    password : String
})

const UserModel = mongoose.model("user" , userSchema);

module.exports = UserModel;
