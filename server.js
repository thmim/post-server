const app = require("./src/app")
const express = require("express");
require("dotenv").config();
const connectDB = require("./src/db/db")
const multer = require("multer")   //middleware helps to read file format data
const uploadFile = require("./src/services/service.storage")
const postModel = require("./src/models/post.model")
// middleweare
const upload = multer({storage:multer.memoryStorage()})
const port = 7000;
connectDB();
app.use(express.json());

// post api
app.post('/create-post', upload.single("image"), async (req,res)=>{
    console.log(req.body);
    console.log(req.file);
    const result = await uploadFile(req.file.buffer)
    // console.log(result);
    const post = await postModel.create({
        image:result.url,
        caption:req.body.caption
    })
    res.status(201).send({
        message:"post created successfully",
        post
    })
})

// get api
app.get('/posts', async (req,res)=>{
    const posts = await postModel.find()
    res.status(201).send({
        message:"successfully get",
        posts
    })
})

app.get('/',(req,res)=>{
  res.send('hello and welcome');
})
app.listen(port,()=>{
    console.log(`my server is running on: ${port}`)
})