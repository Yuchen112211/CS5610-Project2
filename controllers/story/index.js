/**
 * Module dependencies.
 */

var db = require('../../db');
var path = require('path');

var multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    console.log(file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

var imgFilter = function(req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(null, false);
  }
  cb(null, true);
};

var upload = multer({ storage: storage, fileFilter : imgFilter, limits : {fileSize: 1024 * 1024}});

exports.before = upload.single("story-pic");

exports.create = function(req, res, next){
  if (req.fileValidationError) {
    res.redirect("/");
  } else {
    var story = {
      title: req.body.title,
      username: req.body.username,
      content: req.body.content,
      datetime: new Date(),
      like: 0,
      dislike: 0,
    };
    if (req.file) {
      story.pic = req.file.filename;
    }
    db.insert("stories", story, function() {
      res.redirect("/");
    });
  }
};

exports.like = function(req, res, next){
  db.select("stories", { _id: db.getObjectId(req.body.id) }, function(data) {
    if (data === undefined || data.length == 0) {
      return;
    }
    var story = data[0];
    var updateDoc = {
      $set: {
        like: story.like + 1,
      },
    };
    db.update("stories", { _id: story._id }, updateDoc, { upsert: false }, function() {
      res.redirect("/");
    });
  });
};

exports.dislike = function(req, res, next){
  db.select("stories", { _id: db.getObjectId(req.body.id) }, function(data) {
    if (data === undefined || data.length == 0) {
      return;
    }
    var story = data[0];
    var updateDoc = {
      $set: {
        dislike: story.dislike + 1,
      },
    };
    db.update("stories", { _id: story._id }, updateDoc, { upsert: false }, function() {
      res.redirect("/");
    });
  });
};