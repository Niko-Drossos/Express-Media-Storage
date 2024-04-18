const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./src/models/connection');
dotenv.config()

const app = express()
const port = 3000

connectDB()

app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

/* ------------------------------- App router ------------------------------- */
const userRouter = require("./src/routes/user.routes")
app.use("/users", userRouter);
/* const userRouter = require("./routes/user.routes")
app.use("/users", userRouter); */
/* -------------------------------------------------------------------------- */

app.listen(port, () => console.log(`server started at http://localhost:${port}`))