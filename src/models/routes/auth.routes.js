const express = require("express")
const router = express.Router()
/* const path = require("path")
const fs = require("fs") */

/* --------------------------------- Schemas -------------------------------- */
const User = require("../../models/schemas/User")
/* --------------------------------- Helpers -------------------------------- */
const generateJWT = require("../../helpers/generateJWT")
const hash = require("../../helpers/hash")
/* -------------------------------------------------------------------------- */

// TODO: make this authenticate the login
router.post("/register", async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      throw new Error("Missing username or password")
    }

    const { username, password, email } = req.body

    const newUser = await User.create({
      username,
      password: await hash(password), 
      email
    })

    console.log(newUser)

    const userData = {
      userId: newUser._id,
      username: req.body.username,
      password: req.body.password
    }

    const loginToken = generateJWT(userData)

    res.status(200)
    res.json({
      success: true,
      message: "Successfully registered user",
      data: {
        JWT: loginToken
      }
    })
  } catch (error) {
    res.status(500)
    res.json({
      success: false,
      message: "Failed to register user",
      errorMessage: error.message,
      error
    })
  }
})

/* -------------------------------------------------------------------------- */

router.post("/login", (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      throw new Error("Missing username or password")
    }

    // TODO: Make this authenticate the login

    const userData = {
      // userId: ,
      username: req.body.username,
      password: req.body.password
    }

    const loginToken = generateJWT(userData)

    res.status(200)
    res.json({
      success: true,
      message: "Successfully logged in",
      data: {
        JWT: loginToken
      }
    })
  } catch (error) {
    res.status(500)
    res.json({
      success: false,
      message: "Failed to login",
      errorMessage: error.message,
      error
    })
  }
})

module.exports = router