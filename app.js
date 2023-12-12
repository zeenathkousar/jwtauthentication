require('dotenv').config()
const express = require("express");
const app=express()
const port=process.env.PORT || 3000;

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const jwt = require("jsonwebtoken");
const bcrypt=require('bcrypt')

const middleware=require('./auth')

app.set("view engine", 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


const mongoose = require("mongoose");

//connecting to db
let connectDb = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URL, { dbName: "jwttutorial" });
      console.log("conected mongodb");
    } catch (error) {
      console.log("error connecting to mongodb");
    }
  };

connectDb();

let user = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

let User=mongoose.model('jwttut',user);



app.get("/", (req,res)=>{
    res.render("signup");

});
app.post("/", async (req, res) => {
  let { name, email, password } = req.body;
  let hash = await bcrypt.hash(password, 10);
  let user = new User({ name, email, password: hash });
  await user.save();
  res.redirect("/login");
});

app.get('/home',middleware,(req,res)=>{
  let user=req.user;
  res.render('home.ejs',{user})
})

app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      res.render("login", { error: "user is not registered" });
    } else {
      let compare = await bcrypt.compare(password, user.password);
      if (!compare) {
        res.render("login", { error: "password is  incorrect" });
      }
      let token = await jwt.sign({user }, "zeenath@7144");
      console.log(`token is ${token}`)
      res.cookie("token", token);
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error);
  }
});
app.get("/logout", (req, res) => {
  res.clearCookie('token')
  res.redirect("/");
});




app.listen(port, () => {
  console.log("server runnig on 4000");
});