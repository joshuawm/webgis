// app.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(cors());
const upload = multer({
  dest: "./images"
});
// 处理文件上传的请求
app.post("/images", upload.array("file", 20), (req, res, next) => {
  for (let i = 0; i < req.files.length; i++) {
    let newName = req.files[i].path + path.parse(req.files[i].originalname).ext;
    fs.rename(req.files[i].path, newName, function(err) {
      if (err) {
        res.json({
          on_off: false
        });
      }
    });
  }
  res.json({
    on_off: true,
    files: req.files
  });
});

app.get("/getimage", (req, res) => {
  if (req.query.image) {
    let yu = `E:\\vsCode\\myvue\\${req.query.image}`;
    console.log(yu);
    res.sendFile(yu);
  }
});

// app.use(function(err, req, res, next) {});
app.listen(3000);
