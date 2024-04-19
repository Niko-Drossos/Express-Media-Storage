const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./models/connection');
dotenv.config()

const app = express()
const port = 3000

connectDB()

app.use(express.json())
app.use(express.static('src/public'))
app.use(express.urlencoded({ extended: true }))

/* ------------------------------- App router ------------------------------- */
app.use("/auth", require("./models/routes/auth.routes"));
app.use("/user", require("./models/routes/user.routes"));
/* -------------------------------------------------------------------------- */

app.listen(port, () => console.log(`server started at http://localhost:${port}`))