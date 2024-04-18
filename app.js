const express = require('express')

const app = express()
const router = express.Router();
const port = 3000

app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))


/* ------------------------------- App router ------------------------------- */
const userRouter = require("./routes/user.routes")
app.use("/users", userRouter);
/* const userRouter = require("./routes/user.routes")
app.use("/users", userRouter); */
/* -------------------------------------------------------------------------- */




app.listen(port, () => console.log(`server started at http://localhost:${port}`))