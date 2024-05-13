const express = require('express')
const dotenv = require('dotenv')
const { connectDB } = require('./models/connection')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

connectDB()

/* ------------------------------ App settings ------------------------------ */
app.use(express.json())
app.set("view engine", "ejs")
app.set("views", "src/view")
app.use(express.static('src/view'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
/* ------------------------------- App router ------------------------------- */
app.use("/auth", require("./routes/auth.routes"))
app.use("/user", require("./routes/user.routes"))
app.use("/file", require("./routes/file.routes"))
app.use("/search", require("./routes/search.routes"))
app.use("/post", require("./routes/post.routes"))
app.use("/comment", require("./routes/comment.routes"))
app.use("/view", require("./routes/view.routes"))
/* ----------------------------- Viewing routes ----------------------------- */
app.get("/", (req, res) => {
  res.render("index.ejs")
})

app.get("/media", (req, res) => {
  res.render("media.ejs")
})

app.get("/documents", (req, res) => {
  res.render("documents.ejs")
})

app.get("/upload", (req, res) => {
  res.render("upload.ejs")
})

app.get("/login", (req, res) => {
  res.render("login.ejs")
})
/* -------------------------------------------------------------------------- */

app.listen(port, () => console.log(`server started at http://localhost:${port}`))