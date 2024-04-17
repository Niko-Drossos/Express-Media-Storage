const express = require('express')

const app = express()
const router = express.Router();
const port = 3000

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))


/* ------------------------------- App router ------------------------------- */
app.use("/users", router);
/* -------------------------------------------------------------------------- */




app.listen(port, () => console.log(`server started at http://localhost:${port}`))