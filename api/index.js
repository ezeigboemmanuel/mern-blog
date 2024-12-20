const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db.js");
const path = require("path");
const cloudinary = require("cloudinary").v2;
console.log(cloudinary.config().cloud_name);

const uploadMiddleware = multer({ dest: "uploads/" });

const app = express();

const port = process.env.PORT || 4000;

const __dirname2 = path.resolve();

const salt = bcrypt.genSaltSync(10);
const secret = "hsjsjsksksksksrurrd";

// middlewares
app.use(
  cors({
    credentials: true,
    origin: "https://mern-blog-ml6n.onrender.com",
  })
); // for cors
app.use(express.json()); // for json
app.use(cookieParser()); // for cookies

// mongoose.connect(process.env.MONGO_URI);

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username: username });
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // Logged in
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) {
        throw err;
      }

      res.cookie("token", token).json({
        id: userDoc._id,
        username: userDoc.username,
      });
    });
  } else {
    res.status(400).json("Wrong credentials");
  }
});

app.get("/api/profile", async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // read the token with the secret key
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    res.json(info);
  });
});

app.post("/api/logout", async (req, res) => {
  res.cookie("token", " ").json("ok");
});

app.post("/api/post", uploadMiddleware.single("image"), async (req, res) => {
  const { originalname, path } = req.file;
  console.log("PATH: ", path);
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // read the token with the secret key
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const cloudImg = await cloudinary.uploader.upload(newPath);

    const { title, summary, content } = req.body;

    const postDoc = await Post.create({
      title,
      summary,
      content,
      coverImage: cloudImg.secure_url,
      author: info.id,
    });

    res.json(postDoc);
  });
});

app.put("/api/edit/:id", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // read the token with the secret key
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const { id } = req.params;
    const cloudImg = await cloudinary.uploader.upload(newPath);
    const { title, summary, content } = req.body;
    const postDoc = await Post.findById(id);

    const isAuthor =
      JSON.stringify(postDoc.author._id) === JSON.stringify(info.id);

    if (!isAuthor) {
      return res.status(401).json({ error: "You are not the author." });
    }

    const updatedPost = await Post.findByIdAndUpdate(id, {
      title,
      summary,
      content,
      coverImage: newPath ? cloudImg.secure_url : postDoc.coverImage,
    });

    res.json(updatedPost);
  });
});

app.delete("/api/post/:id", async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // read the token with the secret key
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const { id } = req.params;
    const postDoc = await Post.findById(id);
    const parts = postDoc.coverImage.split("/");
    const fileName = parts[parts.length - 1]; // Extract the last part: "ihwklaco9wt2d0kqdqrs.png"
    const imageId = fileName.split(".")[0];
    cloudinary.uploader
      .destroy(imageId)
      .then((result) => console.log("result: ", result));

    await Post.findByIdAndDelete(id);

    res.json("Deleted");
  });
});

app.get("/api/post", async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["username"])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
});

app.get("/api/post/:id", async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate("author", ["username"]);
  res.json(post);
});

// Deployment

if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname2, "/client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname2, "client", "build", "index.html"));
  });
}

app.listen(port, () => {
  connectDB();
  console.log("Server started at http://localhost:" + port);
});
