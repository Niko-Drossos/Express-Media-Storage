const express = require('express')
const dotenv = require('dotenv')
const { connectDB } = require('./models/connection')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
dotenv.config()

const { PORT, frontendUrl } = process.env

const app = express()
const port = PORT || 3000
const host = '0.0.0.0' // This makes the server listen on all available interfaces

connectDB()

const corsOptions = {
  origin: frontendUrl,
  methods: 'POST, GET, OPTIONS',
  credentials: true,
}

/* ------------------------------ App settings ------------------------------ */

app.use(cors(corsOptions))
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
app.use("/vote", require("./routes/vote.routes"))
app.use("/daat", require("./routes/daat.routes"))

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

app.get("/account", (req, res) => {
  res.render("account.ejs")
})

app.get("/daat-chat", (req, res) => {
  res.render("chat.ejs")
})
/* -------------------------------------------------------------------------- */

app.listen(port, host, () => console.log(`server started at http://localhost:${port}`))