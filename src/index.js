const express = require('express')
const dotenv = require('dotenv')
const { connectDB } = require('./models/connection')
dotenv.config()

const app = express()
const port = 3000

connectDB()

app.use(express.json())
app.use(express.static('src/public'))
app.use(express.urlencoded({ extended: true }))

/* ------------------------------- App router ------------------------------- */
app.use("/auth", require("./routes/auth.routes"))
app.use("/user", require("./routes/user.routes"))
app.use("/file", require("./routes/file.routes"))
app.use("/search", require("./routes/search.routes"))
app.use("/post", require("./routes/post.routes"))
app.use("/comment", require("./routes/comment.routes"))
app.use("/view", require("./routes/view.routes"))
/* -------------------------------------------------------------------------- */

app.listen(port, () => console.log(`server started at http://localhost:${port}`))