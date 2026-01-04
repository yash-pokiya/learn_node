require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoutes")
const connectDB = require("./config/db");
const app = express();
const port = process.env.PORT || 3500;
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//ROUTES

app.use("/user" , userRoutes)

app.listen(port, () => {
  console.log(`server run at port ${port}`);
});
