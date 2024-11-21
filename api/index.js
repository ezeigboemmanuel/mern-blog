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
const dotenv = require("dotenv");

dotenv.config();

const uploadMiddleware = multer({ dest: "uploads/" });

const app = express();

const salt = bcrypt.genSaltSync(10);
const secret = "hsjsjsksksksksrurrd";

// middlewares
app.use(cors({ credentials: true, origin: "http://localhost:3000" })); // for cors
app.use(express.json()); // for json
app.use(cookieParser()); // for cookies
app.use("/uploads", express.static(__dirname + "/uploads"));

mongoose.connect(process.env.MONGO_URI);

app.post("/register", async (req, res) => {
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

app.post("/login", async (req, res) => {
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

app.get("/profile", async (req, res) => {
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

app.post("/logout", async (req, res) => {
  res.cookie("token", " ").json("ok");
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
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

    const { title, summary, content } = req.body;

    const postDoc = await Post.create({
      title,
      summary,
      content,
      coverImage: newPath,
      author: info.id,
    });

    res.json(postDoc);
  });
});

app.put("/edit/:id", uploadMiddleware.single("file"), async (req, res) => {
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
      coverImage: newPath ? newPath : postDoc.coverImage,
    });

    res.json(updatedPost);
  });
});

app.delete("/post/:id", async (req, res) => {
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

    await Post.findByIdAndDelete(id);

    res.json("Deleted");
  });
});

app.get("/post", async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["username"])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate("author", ["username"]);
  res.json(post);
});

app.listen(4000);
