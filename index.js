const express = require("express");
const bodyParser = require("body-parser");
// const path = require("path");
const cors = require('cors')
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const userInfo = require('./models/sign_in_up')
const fileLogs = require('./models/logData')
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
// const { readSync } = require("fs");
const app = express();
app.use(bodyParser.json());
app.use(cors())
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
const mongoURI ="mongodb+srv://rahul123:rahul123@cluster0.w2iqn.mongodb.net/DocumentFiles";
mongoose.connect(mongoURI).then(console.log("mongo connected"))
const conn = mongoose.createConnection(mongoURI);
const port = 5000;
let gfs;
let gridfsBucket;
// conn.once("open", () => { gfs = Grid(conn.db, mongoose.mongo);  gfs.collection("Uploads")});

conn.once('open', () => {
  //Init Stream
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'Uploads'
  })
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('Uploads');
})


const storage = new GridFsStorage({
  url: mongoURI,
  file: function (req, file) {
      return new Promise((resolve, reject) => {
          crypto.randomBytes(16, (err, buf) => {
              if (err) {
                  return reject(err);
              }
              const fileInfo = {
                  filename: file.originalname,
                  bucketName:"Uploads",
              };
              resolve(fileInfo);

          });
      });
  },
});

const upload = multer({
  fileFilter: async function  (req, file, cb) {
    console.log(req.body ,file)
      gfs.files.find({ filename: file.originalname })
          .toArray((err, files) => {
              if (files.length > 0) 
              {
                req.fileValidationError = `You cant upload the same file bro`;
                  cb(null, false, req.fileValidationError);
              }
               else               
                cb(null, true);
               })
      }, storage
});

app.post("/upload", upload.single("file"), (req, res) => {

 
  if (req.fileValidationError) {
      res.send(req.fileValidationError)
  }
  else
      res.send("File uploaded successfully");
});

app.get("/fileData",(req,res)=>{

  gfs.files.find().toArray((err, files) => {
   res.send(files)
  })

})
app.post("/downloadFile",(req,res)=>{
  // console.log(req.body);
  gfs.files.findOne({ filename: req.body.imgName}, (err, file) => {
    // console.log(file);
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }

      const readstream = gridfsBucket.openDownloadStreamByName(file.filename);
      readstream.pipe(res);
    
  });

  
})
app.post('/SignIn', async (req, res) => {
  const data = req.body
 console.log(data);
    const findData = await userInfo.findOne( {user: data.Email, pass: data.Password })
    console.log(findData);
    if (findData) {
        res.send({ permission:true })
    }
    else {
        res.json( "wrong password")
    }
})

app.post('/SignUp', async (req,res)=>{
  const data = req.body
console.log(data);
  try {
    const user = new userInfo({ user: data.Email, pass: data.Password })
    await user.save();
} catch (err) {
    console.log(err);
    res.send(err)
}
})

app.post('/logdata', async (req,res)=>{

  const data = req.body
  fileLogs.find(req.body)
  .exec( async (err, files) => {
      if (files.length > 0) 
      {
        res.send(`you cant upload this file since its already presnted with username ${req.body.UserName}
        with type ${req.body.typeOfFIle}`)
        
      }
       else               
       {

        try {
          const user = new fileLogs(data)
          await user.save();
          res.send("file uploaded successfully")
       } catch (err) {
          console.log(err);
          res.send(err)
       }
       }
       })

})

app.post('/filterByType' , async(req,res)=>{
  const data = req.body.name;
  console.log(data,"123123");
  fileLogs.find({UserName:req.body.name},(err, data) => {
    const filterData =data.filter((item)=>{
      return item.typeOfFIle ===req.body.fitlerByType})
   res.send(filterData)
 })
})
app.post('/logAllData', async (req,res)=>{
  const data = req.body.name;
 console.log(data,"123123");
 fileLogs.find({UserName:req.body.name},(err, data) => {
  !err ?res.send(data): res.send([])
})
}
)

app.post('/sortData', async(req,res)=>{
  if(req.body.sortBy==='fileName'){
    fileLogs.find({UserName:req.body.name}).sort({fileName:1}).exec((err, result) =>{  
      if (err) throw err;  
      console.log(result);  
 res.send(result)
      });  
      

  }
}) 


app.listen(port, () => console.log(`Server started on port ${port}`));


















// const express = require('express')
// const multer = require('multer')
// const { readdir } = require('node:fs/promises');
// const app = express()
// const port = 3000

// const uploadfile = multer({
  
//   fileFilter:  async function (req, file, cb) {
//     const typeOfFile=req.body.typeOfFile
//     const files = await readdir(typeOfFile);
//       if (files.includes(file.originalname)) {
//          req.fileValidationError = "already exit";
//          return cb(null, false, req.fileValidationError);
//    }
//    cb(null, true ,typeOfFile);
// },
//   storage: multer.diskStorage({
//       destination: async function (req, file, cb) {
//         const typeOfFile=req.body.typeOfFile
//       cb(null, typeOfFile)
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname)
//     }
//   })
// }).single("user_file")
 

// app.post('/upload', uploadfile, async (req, res) => {
//   const data =req.fileValidationError
//   console.log(req.fileValidationError);
//   if(data)
//     res.send(data)
//     else{
//       res.send('Done uploading')
//     }
//   })
// app.listen(port, () => {
//   console.log(`app listening on port ${port}`)
// })
