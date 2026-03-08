const app = require("./src/app")
const express = require("express");
require("dotenv").config();
const connectDB = require("./src/db/db");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer")   //middleware helps to read file format data
const uploadFile = require("./src/services/service.storage")
const postModel = require("./src/models/post.model");
const userModel = require("./src/models/user.model");
// middleweare
const upload = multer({ storage: multer.memoryStorage() })
const port = 7000;
connectDB();
app.use(express.json());
app.use(cookieParser());

// post api
app.post('/create-post', upload.single("image"), async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  const result = await uploadFile(req.file.buffer)
  // console.log(result);
  const post = await postModel.create({
    image: result.url,
    caption: req.body.caption
  })
  res.status(201).send({
    message: "post created successfully",
    post
  })
})

// get api
app.get('/posts', async (req, res) => {
  const posts = await postModel.find()
  res.status(201).send({
    message: "successfully get",
    posts
  })
})

// register post api
app.post('/register', async (req, res) => {
  const { userName, email, password } = req.body;

  const isAlreadyUserExist = await userModel.findOne({
    email
  })

  if (isAlreadyUserExist) {
    return res.status(409).send({
      message: "user already exist"
    })
  }
  const user = await userModel.create({
    userName, email, password
  })
  // create json web token
  const token = jwt.sign({
    id: user._id
  }, process.env.JWT_SECRET)
  res.cookie("token", token)
  res.status(201).send({
    message: "register done",
    user,

  })
})

// dummy post api
app.post("/create", async (req, res) => {
  console.log(req.body)
  console.log(req.cookies.token)
  
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({
      message: "unauthorized"
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await userModel.findOne({
      _id:decoded.id
    })
    console.log(user)
  } catch (err) {
    res.status(401).send({
      message: "invalid token"
    })
  }

  res.send("done")

})

app.get('/', (req, res) => {
  res.send('hello and welcome');
})
app.listen(port, () => {
  console.log(`my server is running on: ${port}`)
})