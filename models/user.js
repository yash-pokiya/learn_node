const mongoose = require("mongoose")
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
