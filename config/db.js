const mongoose = require("mongoose");

const dbConnection = async() => {
   try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("DB Connection successful...!");
   } catch (error) {
    if(error){
        console.log("some issue with connectionwith db");
        console.log(error.messege)
    }
   }
}

module.exports = dbConnection